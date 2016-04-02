// Ajaxify
// v1.0.1 - 30 September, 2012
// https://github.com/browserstate/ajaxify
(function(window, undefined) {
	// Prepare our Variables
	var History = window.History,
		$ = window.jQuery,
		document = window.document;
	
	// Check to see if History.js is enabled for our Browser
	if(!History.enabled) return false;
	
	// Wait for Document
	$(function() {
		// Prepare Variables
		var // Application Specific Variables
			contentSelector = "#content,article:first,.article:first,.post:first",
			$content = $(contentSelector).filter(":first"),
			contentNode = $content.get(0),
			$menu = $("#menu,#nav,nav:first,.nav:first").filter(":first"),
			activeClass = "active selected current youarehere",
			activeSelector = ".active,.selected,.current,.youarehere",
			menuChildrenSelector = "> li,> ul > li",
			completedEventName = "statechangecomplete",
			
			// Application Generic Variables 
			$window = $(window),
			$body = $(document.body),
			rootUrl = History.getRootUrl().replace(/\/?$/, ""),
			scrollOptions = {
				duration: 800,
				easing: "swing"
			};
		
		// Trim last / from root url
		//if(rootUrl.substr(-1) == "/")
			//rootUrl = rootUrl.substr(0, rootUrl.length - 1);
		
		// Ensure Content
		if($content.length === 0) $content = $body;
		
		var getURL = function($this) {
			if($this.is("a"))
				return $this.attr("href") || "";
			else if($this.is("form"))
				return $this.attr("action") || "";
			else return "";
		};
		
		// Internal Helper
		$.expr[":"].internal = function(obj, index, meta, stack) {
			// Prepare
			var $this = $(obj),
				url = getURL($this);
			
			// Check link
			return (url.substring(0, rootUrl.length) === rootUrl) || (url.match(/^https?:\/\/(.*)?/i));
		};
		
		// Secure Helper
		$.expr[":"].secure = function(obj, index, meta, stack) {
			// Prepare
			var $this = $(obj),
				url = getURL($this);
			
			// Check link
			return $this.is(":internal") || url.substring(0, 8) === "https://";
		};
		
		// HTML Helper
		var documentHtml = function(html) {
			// Prepare
			var result = String(html).replace(/<\!DOCTYPE[^>]*>/i, "")
				//.replace(/<(html|head|body|title|meta|script)([\s\>])/gi, "<div class=\"document-$1\"$2")
				//.replace(/<\/(html|head|body|title|meta|script)\>/gi, "</div>");
				.replace(/<(html|head|body|title|meta)([\s\>])/gi, "<div class=\"document-$1\"$2")
				.replace(/<\/(html|head|body|title|meta)\>/gi, "</div>");
			
			// Return
			return $.trim(result);
		};
		
		// Ajaxify Helper
		$.fn.ajaxify = function() {
			// Prepare
			var $this = $(this);
			
			// Ajaxify Links
			$this.find("a:internal:not(.no-ajaxy):not([href^='#']):not([href^='javascript:'])").click(function(event) {
				// Prepare
				var $this = $(this),
					url = $this.attr("href"),
					title = $this.attr("title") || null,
					data;
				
				try { data = JSON.parse($this.attr("data")) || {}; }
				catch(Exception) { data = {}; }
				
				if(typeof data.method != "string") {
					data.method = $this.attr("data-method") || "GET";
				} if(typeof data.data != "object") {
					data.data = $this.attr("data-data") || {};
				}
				
				// Continue as normal for cmd clicks etc
				if(event.which == 2 || event.metaKey) return true;
				
				// Ajaxify this link
				History.pushState(data, title, url);
				event.preventDefault();
				return false;
			});
			
			// Ajaxify Forms
			$this.find("form:internal:not(.no-ajaxy):not([action^='#']):not([action^='javascript:']):not([onsubmit]):not([enctype])").submit(function(event) {
				// Prepare
				var $this = $(this),
					url = $this.attr("data-action") || $this.attr("action"),
					title = $this.attr("title") || null,
					data = {};
				
				// Save all TinyMCE editors
				if(typeof tinymce == "object") {
					for(var i = 0; i < tinymce.editors.length; i++) {
						tinymce.editors[i].save();
					}
				}
				
				// Get method and data
				data.method = $this.attr("data-method") || $this.attr("method") || "POST";
				data.data = $this.serialize() || "";
				
				// Continue as normal for cmd clicks etc
				if(event.which == 2 || event.metaKey) return true;
				
				// Ajaxify this link
				History.pushState(data, title, url);
				event.preventDefault();
				return false;
			});
			
			// Chain
			return $this;
		};
		
		// Ajaxify our Internal Links
		$body.ajaxify();
		
		// Hook into State Changes
		$window.bind("statechange", function() {
			// Prepare Variables
			var State = History.getState(),
				url = State.url,
				relativeUrl = url.replace(rootUrl, ""),
				method = "GET",
				data = {};
			
			// Set Loading
			$body.addClass("loading").animate({ scrollTop: 0 }, scrollOptions);
			
			// Start Fade Out
			// Animating to opacity to 0 still keeps the element's height intact
			// Which prevents that annoying pop bang issue when loading in new content
			//$content.animate({ opacity: 0 }, 800);
			
			// Get the request method and data.
			if(typeof State.data.method == "string")
				method = State.data.method;
			if((typeof State.data.data == "object") || (typeof State.data.data == "string"))
				data = State.data.data;
			
			// Ajax Request the Traditional Page
			$.ajax({
				url: url,
				type: method,
				data: data,
				success: function(data, textStatus, jqXHR) {
					// Save and destroy all TinyMCE editors
					if(typeof tinymce == "object") {
						for(var i = 0; i < tinymce.editors.length; i++) {
							tinymce.editors[i].save();
							tinymce.editors[i].remove();
						}
					}
					
					// Prepare
					var $data = $(documentHtml(data));
					
					// Update content
					$("[data-ajaxify]:not(script)").each(function() {
						var $this = $(this),
							id = $this.attr("data-ajaxify"),
							$new = $data.find("[data-ajaxify]").filter(function() {
								return id == $(this).attr("data-ajaxify");
							}).filter(":first");
						
						if($new.length < 1)
							$new = $("<span></span>").attr("data-ajaxify", id);
						
						// Replace old element with the new element
						$this.replaceWith($new.ajaxify());
						$this = $new;
					});
					
					// Evaluate javascript
					$data.find("script[data-ajaxify]").each(function() {
						eval($(this).html());
					});
					
					// Update the title
					document.title = $data.find(".document-title:first").text();
					try {
						document.getElementsByTagName("title")[0].innerHTML = document.title.replace("<", "&lt;").replace(">", "&gt;").replace(" & ", " &amp; ");
					} catch(Exception) {}
					
					// Complete the change
					$body.removeClass("loading").animate({ scrollTop: 0 }, scrollOptions);
					$window.trigger(completedEventName);
					
					// Inform Google Analytics of the change
					if(typeof window._gaq !== "undefined") window._gaq.push([ "_trackPageview", relativeUrl ]);
					
					// Inform Piwik Analytics of the change
					if(typeof window._paq != "undefined") {
						window._paq.push([ "setDocumentTitle", document.title ]);
						window._paq.push([ "setCustomUrl", "/" + relativeUrl ]);
						window._paq.push([ "trackPageView" ]);
					}
					
					// Inform ReInvigorate of a state change
					if((typeof window.reinvigorate !== "undefined") && (typeof window.reinvigorate.ajax_track !== "undefined"))
						reinvigorate.ajax_track(url);
						// ^ we use the full url here as that is what reinvigorate supports
				},
				error: function(jqXHR, textStatus, errorThrown) {
					$body.removeClass("loading");
					document.location.href = url;
					return false;
				}
			}); // end ajax
		}); // end onStateChange
	}); // end onDomLoad
})(window); // end closure
