(function () {
    var stickOffset;
    var sidebarSelector = '.sidebar';
    var stickyClass = 'is-fixed';
    var isSticky = false;

    function stickySidebar() {
        stickOffset = $(sidebarSelector).offset().top;

        //registering event handlers
        $(window).scroll(function () {
            if (!isSticky && $(window).scrollTop() >= stickOffset) {
                isSticky = true;
                $(window).trigger('stick-sidebar');
            } else if (isSticky && $(window).scrollTop() < stickOffset) {
                isSticky = false;
                $(window).trigger('unstick-sidebar');
            }
        });
        $(window).on('stick-sidebar', function () {
            $(sidebarSelector).addClass(stickyClass);

        });
        $(window).on('unstick-sidebar', function () {
            $(sidebarSelector).removeClass(stickyClass);
        });
    }

    function animateScroll() {
        var $sidebarLinks = $('.resources__list__endpoints li a');
        var animLock = false;
        $sidebarLinks.click(function (e, data) {
            e.preventDefault();

            // scroll animation lock - prevent multiple link clicks during animation
            if (animLock) {
                return false;
            }
            animLock = true;

            // getting hash value without hash sign, calculating target offset
            var anchor = this.hash.substr(1);
            var targetElement = $('a[name="' + anchor + '"]');
            var targetOffset = targetElement.offset().top;

            $("html, body").animate({scrollTop: targetOffset}, 400, function () {
                animLock = false;
            });
        });
    }

    $(document).ready(function () {
        stickySidebar();
        animateScroll();
    });

})($);