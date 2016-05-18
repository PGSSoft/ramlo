(function () {
    var stickOffset;
    var sidebarSelector = '.sidebar';
    var stickyClass = 'is-fixed';
    var isSticky = false;

    //handle the sticky sidebar
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

    //handle menu & scrolling effects - scroll animations, menu highlighting
    function animateScroll() {
        var $sidebarLinks = $('.resources__list__endpoints li a');
        var sectionOffsets = [];
        $sidebarLinks.each(function (el) {
            sectionOffsets.push($('a[name="' + this.hash.substr(1) + '"]').offset().top);
        });
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
        $(window).scroll(function () {
            var offset = $(window).scrollTop();

            var index = sectionOffsets.findIndex(function (elem) {
                return (offset + 50) < elem; //50px as a buffer
            });
            if (index >= 1) {
                $sidebarLinks.removeClass("is-current").eq(index - 1).addClass("is-current");
            } else {
                $sidebarLinks.removeClass("is-current");
            }
        });
    }

    //handle example tabs - prevent scrolling to hidden inputs, activate related content on click
    function initTabs() {
        $('label').click(function (e) {
            e.preventDefault();
            var forEl = $(this).attr('for');
            $('#' + forEl).trigger('click');
            $('.example__content[data-tab=' + forEl + ']').addClass('is-active').siblings().removeClass('is-active');
        });
    }

    //initialize scripts
    $(document).ready(function () {
        stickySidebar();
        animateScroll();
        initTabs();
    });

})($);