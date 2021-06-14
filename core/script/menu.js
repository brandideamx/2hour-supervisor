function Menu(courses, data) {
    this.div = $('<div class="itemContainer"></div>');
    /*
    for(var i = 0; i<courses.length; i++){
        if($(courses[i]).attr('menu')){
            var menuItem = $('<div class="menuItem"><a href="javascript:void(0);" class="menu-item">' + courses[i].label + '</a></div>');
            menuItem.attr('menuID', courses[i].id);
            menuItem.click(this.menuClick);
            this.div.append(menuItem);
        }
    }
    */
    this.div.append('MENU')
        .click(function() {
            _shell.gotoSection(0);
        });
    $('#shell_menu').append(this.div);

    var container = $('<div class="mainColumn"></div>');
    $('#shell_menu').append(container);
    $('#shell_menu').append('<div class="global-timer" onclick="timeup()"></div>');
    container.append('<div class="logo"><div style="width:19px;height:19px;" onclick="gonext()"></div></div>');
}

function gonext() {
    _shell.tracking.setSectionStatus('C');
    _shell.tracking.checkLessonComplete();
    //this is to autocomplete some sections on a click
}

function gonextall() {
    _shell.tracking.completeAll();
    //this is to autocomplete some sections on a clickssasasffs
}
/*
Menu.prototype.menuClick = function(e){
    _shell.gotoSection($(this).attr('menuID'));
}
*/
Menu.prototype.setStatus = function(id) {
    //$('#shell_menu .menuItem').removeClass('active');
    //$('#shell_menu .menuItem[menuID=' + id + ']').addClass('active');
}

Menu.prototype.toggleLogo = function() {
    if ($('#shell_menu').hasClass('hidden')) {
        $('#shell_menu').removeClass('hidden');
        TweenMax.set('#shell_menu', { autoAlpha: 1 });
    } else {
        $('#shell_menu').addClass('hidden');
        TweenMax.set('#shell_menu', { autoAlpha: 0 });
    }
}
