/* Banner
 * This script creates a function similar to javascript's native alert() function, but doesn't block the whole screen. Instead, it shows a small banner at the top, that fades out after 10 seconds (unless stayFocused is set to true).
 *
 * @attr message (string) The text to show in the banner.
 * @attr stayFocused = false (bool) Keep the banner in view (example: before an ajax request, show a banner with this on (true), when the request is done show another banner with this off (false)).
 */
jQuery(document).ready(function($) {
	$.banner = function(message, stayFocused) {
		// Delete the banner if no message was given
		if((message == undefined) || (message == null) || (message == "")) {
			$.banner.timeout = false;
			$(".banner").fadeOut(400, function() {
				$(".banner").remove();
			});
			return;
		}
		
		// Add a new banner to the DOM
		if($(".banner").length < 1)
			$("<div></div>").addClass("banner").css({
				"position": "fixed",
				"z-index": 999999999,
				"top": "40px",
				"width": "100%",
				"background-color": "rgba(0, 0, 0, 0.7)",
				"box-shadow": "0px 0px 7px #000000",
				"min-width": "200px",
				"max-width": "40%",
				"max-height": "80px",
				"padding": "15px",
				"color": "#ffffff",
				"text-align": "center",
				"margin": "0px calc(30% - 40px)"
			}).click(function() {
				$.banner.timeout = false;
				$(".banner").fadeOut(400, function() {
					$(".banner").remove();
				});
			}).appendTo("body");
		
		// Set banner text
		$(".banner").text(message);
		
		// Set banner timeout
		if(stayFocused == undefined) stayFocused = false;
		if(stayFocused != true) {
			if((typeof $.banner.timeout != "undefined") && ($.banner.timeout != false)) {
				$.banner.timeout.clearTimeout();
				$.banner.timeout = false;
			}
			
			$.banner.timeout = window.setTimeout(function() {
				$.banner.timeout = false;
				$(".banner").fadeOut(400, function() {
					$(".banner").remove();
				});
			}, 10000);
		}
		
		// Log this in the console
		console.log("Now showing banner: " + message);
	};
	
	$.banner.timeout = false;
});
