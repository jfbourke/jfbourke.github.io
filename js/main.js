

(function ($) {
    "use strict";

    $(document).ready(function() {
		$(window).scroll(function() {
			
			var b = $("body"), t = b.scrollTop(), h = $("header#site-header");
			(t > 0) ? h.addClass("is-sticky") : h.removeClass("is-sticky");
			
		});
	});
	
}(jQuery));
