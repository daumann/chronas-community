$( document ).ready(function() {
    //calculateBadges()
});

function calculateBadges(){
    locals.badgeList = [];

    // TODO: calculate badges and add them here!
    // Either presavelist or calculate!

    console.log("info:",locals.member);

    if (locals.member.mentoring["swap"]){
        locals.badgeList.push({src: '/images/cModerator.jpg', title: 'Interested in Community Moderating'});
    }
    if (locals.member.mentoring["paid"]){
        locals.badgeList.push({src: '/images/hModerator.jpg', title: 'Interested in History Moderating'});
    }


//#C0B954 GOLD
//#C09454 BRONZE
//#A6A6A6 SILVER
//				$("#progress-bar").css("width", "50%");
    /*Math.round(num * 100) / 100
     Total Logins
     p= member.loginCount
     */
    var goldColor = "#C0B954";
    var silverColor = "#A6A6A6";
    var bronzeColor = "#C09454";


    var loginCount = member.loginCount;
    if (loginCount < 10){
        $("#mTotalLogins").find(".loadText").html(Math.round(loginCount/10 * 100) / 100  + "%");
        $("#mTotalLogins").find(".progress-bar").css("background-color",bronzeColor);
    }
    else if (loginCount < 20){
        locals.badgeList.push({src: '/images/b_login.jpg', title: 'Bronze Login Count: '+loginCount});
        var full=20; var start=10;
        $("#mTotalLogins").find(".loadText").html(Math.round((loginCount-start)/full * 100) / 100  + "%");
        $("#mTotalLogins").find(".progress-bar").css("background-color",silverColor);
    }
    else if (loginCount < 50){
        locals.badgeList.push({src: '/images/s_login.jpg', title: 'Silver Login Count: '+loginCount});
        var full=50; var start=20;
        $("#mTotalLogins").find(".loadText").html(Math.round((loginCount-start)/full * 100) / 100  + "%");
        $("#mTotalLogins").find(".progress-bar").css("background-color",goldColor);
    }
    else if (loginCount < 100){
        locals.badgeList.push({src: '/images/g_login.jpg', title: 'Gold Login Count: '+loginCount});
        var full=100; var start=50;
        if (loginCount >full) loginCount = full;
        $("#mTotalLogins").find(".loadText").html(Math.round((loginCount-start)/full * 100) / 100  + "%");
        $("#mTotalLogins").find(".progress-bar").css("background-color",goldColor);
    }
};
