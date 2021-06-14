/**
 * Convo Menu
 */

var Menu = (function() {
    this.xml;
    this.poll = this.pollForContent();
});

Menu.prototype = {
    pollForContent: function() {
        return setInterval(this.pollCheck, 500);
    },

    pollCheck: function() {
        if (typeof _shell !== 'undefined' && _shell !== undefined) {
            clearInterval(_Menu.poll);
            if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
                // console.log('| _loadedData is set');
                _Menu.config(_loadedData);
            } else {
                // console.log('| Trying again...');
                _shell.tryGetData(function(data) {
                    _Menu.config(data);
                });
            }
        }
    },

    config: function(xml) {
        _shell.hideLoader();
        this.xml = $(xml);
        this.root = this.xml.find('contentRoot').text();
        $('.mainLabel').html(this.xml.find('mainLabel').text());
        $('.title').html(this.xml.find('title').text());
        $('.copy').html(this.xml.find('copy').text());

        var _me = this;
        this.xml.find('person').each(function() {
            var p = $('<div class="person"></div>');
            p.append('<div class="check"></div>');
            if (_shell.isSectionComplete($(this).find('sectionID').text())) {
                p.addClass('complete');
            }
            p.attr('id', $(this).find('sectionID').text())
                .append('<img src="' + _me.root + $(this).find('thumb').text() + '" />')
                .append('<div class="label">' + $(this).find('label').text() + '</div>')
                .click(function() {
                    log('ID', $(this).attr('id'));
                    _shell.gotoSection($(this).attr('id'));
                })
            $('.people').append(p);
        });

        if ($('.person.complete').length == $('.person').length) {
            $('.next').removeClass('disabled');
        }

        $('.next').html(this.xml.find('buttons next').text()).click(function() {
            if (!$(this).hasClass('disabled')) {
                //_shell.nextSection();
                $('.mainLabel').html(_Menu.xml.find('outro main').text());
                $('.title').html(_Menu.xml.find('outro header').text());
                $('.copy').html(_Menu.xml.find('outro body').text());
                $('.next').unbind('click').bind('click', function() {
                    _shell.activityComplete();
                    _shell.nextSection();
                });
            }
        });
    }
};

_Menu = new Menu();
