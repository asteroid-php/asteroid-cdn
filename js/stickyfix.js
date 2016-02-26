// Stickyfix
jQuery(document).ready(function($) {
	$.stickyfix = {};
	$.stickyfix.helper = function(event, $this) {
		var $this = $(this || $this),
			scrolltop = $this.scrollTop(),
			scrolltopi = 0 - scrolltop,
			scrollleft = $this.scrollLeft(),
			scrolllefti = 0 - scrollleft;
		
		$("[data-stickyfix]:not(.stickyfix-placeholder)").each(function() {
			var $this = $(this),
				height = $this.outerHeight(true),
				offset = parseInt($this.attr("data-stickyfix-offset")) || 0;
			
			// Use other offset?
			if($(window).width() >= 768) offset = parseInt($this.attr("data-stickyfix-sm-offset")) || offset;
			if($(window).width() >= 992) offset = parseInt($this.attr("data-stickyfix-md-offset")) || offset;
			if($(window).width() >= 1200) offset = parseInt($this.attr("data-stickyfix-lg-offset")) || offset;
			
			// Check element
			if(!$this.prev().is(".stickyfix-placeholder"))
				$this.before("<" + $this[0].nodeName + " class=\"stickyfix-placeholder\"></" + $this[0].nodeName + ">");
			
			var $placeholder = $this.prev(),
				$all = $([ $this[0], $placeholder[0] ]),
				top = $placeholder.offset().top - offset,
				width = $placeholder.width();
			
			// Should stickyfix be enabled on this element now?
			var size = $this.attr("data-stickyfix");
			size = size == "lg" ? 1200 : (size == "md" ? 992 : (size == "sm" ? 768 : 0));
			
			if((top <= scrolltop) && (($(window).width() >= size) || (size == 0))) $all.addClass("stickyfix-float");
			else $all.removeClass("stickyfix-float");
			
			$placeholder.css("height", height);
			$this.css({ top: offset, width: width, "margin-left": scrolllefti });
		});
	};
	
	// $.stickyfix.refresh(): Refreshes stickyfix - you should call this after changing the contents of stickyfix-enabled elements
	$.stickyfix.refresh = function() {
		$.stickyfix.helper({}, window);
	};
	
	// Add some css to the document head
	$.stickyfix.css = "[data-stickyfix]:not(.stickyfix-placeholder) { position: static; }";
	$.stickyfix.css += ".stickyfix-float:not(.stickyfix-placeholder) { position: fixed; }";
	$.stickyfix.css += ".stickyfix-placeholder { position: static; width: 100%; margin: 0px; padding: 0px; border: 0px none; visibility: hidden; }";
	$.stickyfix.css += ".stickyfix-placeholder:not(.stickyfix-float) { height: 0px !important; }";
	$.stickyfix.css += "[data-stickyfix]:not(.stickyfix-placeholder):not(.stickyfix-float) { top: 0px !important; margin-left: 0px !important; }";
	$("head").append("<style id=\"stickyfix-css\">" + $.stickyfix.css + "</style>");
	
	// .stickyfix(): Enables stickyfix on an element
	$.fn.stickyfix = function(offset) {
		$(this).attr("data-stickyfix", "true");
		if(typeof offset == "number")
			$(this).attr("data-stickyfix-offset", offset);
		
		// ... should we have disabled stickyfix for this element?
		if(offset == false)
			$(this).attr("data-stickyfix", null).attr("data-stickyfix-offset", null);
		
		// Trigger stickyfix now
		$(window).trigger("scroll");
		
		// Chain
		return $(this);
	}
	
	// Refresh stickyfix on scroll, touchmove and resize events
	$(window).on({
		scroll: $.stickyfix.helper,
		touchmove: $.stickyfix.helper,
		
		// Also handle resize events, as css @media queries can move elements and/or change their height
		resize: $.stickyfix.helper
	});
});
