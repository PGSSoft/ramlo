(function () {
    //handle example tabs - prevent scrolling to hidden inputs, activate related content on click
    function initTabs() {
        $('label').click(function (e) {
            e.preventDefault();
            var forEl = $(this).attr('for');
            $('#' + forEl).trigger('click');
            $('.example__content[data-tab=' + forEl + ']').addClass('is-active').siblings().removeClass('is-active');
        });
    }

    function initExpandableExamples() {
        $('.documentation__endpoints__examples a.examples__toggle').click(function () {
            toggleExpandExamples($(this).parent());
        });
    }

    var EXPAND_TIMEOUT_MS = 500;

    function toggleExpandExamples(example) {
        var isExpanded = example.hasClass('is-expanded');
        if (example) {
            if (isExpanded) {
                example.addClass('is-collapsing').removeClass('is-expanded');
                setTimeout(function () {
                    example.parent().height('');
                    example.removeClass('is-collapsing');
                }, EXPAND_TIMEOUT_MS);
            } else {
                var endpointHeight = example.outerHeight();
                example.parent().height(endpointHeight);
                example.addClass('is-expanded');
            }
        }
    }

    //initialize scripts
    $(document).ready(function () {
        initTabs();
        initExpandableExamples();
        $('body').scrollspy({target:'#resources-nav'});
    });

})($);