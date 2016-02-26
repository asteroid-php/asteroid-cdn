// function submitForm()
// Requires History.js and optionally uses banner.js
jQuery(document).ready(function($) {
	$.submitForm = function(form_, callbackFunction) {
		var $form = $(form_),
			banner = $.banner || function(message, hide) {
				if(hide != true)
					alert(message);
			};
		
		if(callbackFunction == undefined) {
			banner("Loading...", true);
			
			callbackFunction = function(success, response) {
				if(success == true) {
					try { var response = $.parseJSON(response); }
					catch(SyntaxError) { var response = { "success": false, "error": "Response was not json-encoded, contact support for more infomation." }; }
					
					if((typeof response.fancybox == "string") || (typeof response.fancybox == "object")) {
						// Open response.fancybox in a fancybox.
						$.fancybox.open(response.fancybox);
						banner(true);
					} else if((typeof response.success != undefined) && (response.success == true)) {
						// Success!
						if(typeof response.message == "string")
							banner("Success! " + response.message);
						else banner("Success!");
						
						if($form.attr("data-next") == "refresh") $(window).trigger("statechange");
						else if($form.attr("data-next") != null) History.pushState(null, null, form.attr("data-next"));
						else if(History.getState().hash == "/auth/logout") History.pushState(null, null, "/");
						else if(($("[data-ajaxify]").find("input:not([type=\"hidden\"]):not([type=\"submit\"]):not([type=\"reset\"]):not(:disabled)").length < 1)) $(window).trigger("statechange");
						
						if($.fancybox || false)
							$.fancybox.close();
						
						return true;
					} else banner("Error: " + (typeof response.error != "undefined" ? response.error : "Unknown error."));
				} else banner("Error: Unknown error.");
				$form.find('[type="submit"]').prop("disabled", false);
				return false;
			};
		}
		
		if($form.attr("data-action") == null) return false;
		
		$.ajax({
			url: $form.attr("data-action"),
			type: "POST",
			data: $form.serialize(),
			success: function(response) { callbackFunction(true, response); },
			error: function(response) { callbackFunction(false, response); }
		});
	}
});
