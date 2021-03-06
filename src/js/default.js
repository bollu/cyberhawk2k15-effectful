"use strict";
HTMLImports.whenReady(function() {
    Polymer({
        is: 'x-element'
    });
});

/*
HTMLImports.whenReady(function() {
    Polymer({
        is: 'x-element'
    });
});
*/

console.log = function() {};


function deg2rad(degree) {
    return degree * Math.PI / 180.0;
}

function is_mobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function popup_toast(string) {
    var toast = document.querySelector("#toast");
    Polymer.dom(GLOBALS.toastElement).textContent = string;
    toast.show();
}

function send_request_to_server(request_name, data, callback) {
    var REQUEST_URL = "http://cyberhawk.iecsemanipal.com/api";
    var API_KEY = "fUJxtW62tresIB7m";
    data["API_KEY"] = API_KEY;
    data["REQUEST"] = request_name;
    data["SECURITY"] = "OFF";

    console.log("sending request (" + request_name + ")", data);
    //onsole.log("stringified: ", jQuery.param(data))

    var requestFn = function() {
        $.ajax({
            type: "GET",
            url: REQUEST_URL,
            data: data,
            timeout: 32000 // sets timeout
        }).done(function(response) {
            response = JSON.parse(response);
            response.success = true;
            console.log("response for (" + request_name + "): ", response);

            callback && callback(response);
        });
    };
    setTimeout(requestFn, 1000);
}

var REQUESTS = {
    //calls callback with true for successful login, false for unsucessful login
    login: function(email, password, callback) {
        var data = {}
        data["EMAIL"] = email;
        data["PASSWORD"] = password;
        send_request_to_server("playerLogin", data, callback)
    },

    register: function(data, callback) {
        send_request_to_server("register", data, callback);

    },

    logout: function(sessionID) {
        var data = {}
        data["sessionID"] = sessionID;
        send_request_to_server("playerLogout", data, function(response) {
            console.log("logged out");
        });
    },

    answer: function(sessionID, answer, callback) {
        var data = {}
        data["sessionID"] = sessionID;
        data["ANSWER"] = answer;
        send_request_to_server("checkAnswer", data, callback);
    },

    get_question: function(sessionID, callback) {
        var data = {}
        data["sessionID"] = sessionID;
        send_request_to_server("getQuestion", data, callback);
    },

    get_hints: function(sessionID, callback) {
        var data = {
            "sessionID": sessionID
        };
        send_request_to_server("getHints", data, callback);
    },

    get_position: function(sessionID, callback) {
        var data = {
            "sessionID": sessionID
        };
        send_request_to_server("getMyPosition", data, callback);
    },

    get_player_info: function(sessionID, callback) {
        var data = {
            "sessionID": sessionID
        };
        send_request_to_server("getPlayer", data, callback);
    }


};

var GLOBALS = {
    camera: null,
    cssRenderer: null,
    cssScene: null,
    mousePos: null,
    toastElement: null,

};
var STATE = {
    questionNumber: 1,
    top_card: null,
    showing_hints: true,
    sessionID: null,


    switch_card_anim: function(new_top) {
        var old_top = this.top_card;
        new_top.position.y = -1000;
        new_top.position.z = 0;

        var hide_tween = new TWEEN.Tween(old_top.position)
            .to({
                z: -100,
                y: -2000,
            }, 500)
            .easing(TWEEN.Easing.Cubic.In);

        var show_tween = new TWEEN.Tween(new_top.position).to({
            y: 0
        }).easing(TWEEN.Easing.Cubic.Out);;

        hide_tween.start();
        show_tween.delay(100).start();
        this.top_card = new_top;
    },

    try_login: function() {
        this.login_card_elem.login_button.disabled = true;
        this.login_card_elem.goto_register_button.disabled = true;
        this.profile_card_elem.logout_button.disabled = false;
        this.login_card_elem.login_progress.indeterminate = true;
    },

    error_login: function(error_message) {
        this.login_card_elem.login_button.disabled = false;
        this.login_card_elem.goto_register_button.disabled = false;
        this.login_card_elem.login_progress.indeterminate = false;
        this.login_card_elem.login_progress.value = 0;

        popup_toast(error_message);
    },

    success_login: function() {
        this.login_card_elem.login_button.disabled = false;
        this.login_card_elem.goto_register_button.disabled = false;
        this.login_card_elem.login_progress.indeterminate = false;
        this.login_card_elem.login_progress.value = 0;

        //enable logout buttons
        this.profile_card_elem.logout_button.disabled = false;
    },

    try_register: function() {
        this.register_card_elem.register_button.disabled = true;
        this.register_card_elem.go_to_login_button.disabled = true;
        this.register_card_elem.register_progress.indeterminate = true;

    },

    error_register: function(error_message) {
        this.register_card_elem.register_button.disabled = false;
        this.register_card_elem.go_to_login_button.disabled = false;
        this.register_card_elem.register_progress.indeterminate = false;
        popup_toast(error_message)
    },
    success_register: function() {
        popup_toast("The hawk accepts you. Now play");
        this.register_card_elem.register_button.disabled = false;
        this.register_card_elem.go_to_login_button.disabled = false;
        this.register_card_elem.register_progress.indeterminate = false;

    },

    try_answer: function(submit_button, answer_progress, answer) {
        submit_button.disabled = true;
        answer_progress.indeterminate = true;
        popup_toast("trying: " + answer);
    },

    error_answer: function(submit_button, answer_progress) {
        submit_button.disabled = false;
        answer_progress.indeterminate = false;

        popup_toast("The hawk disapproves");
    },

    error_answer_too_many_req: function(submit_button, answer_progress) {
        submit_button.disabled = false;
        answer_progress.indeterminate = false;

        popup_toast("Stop spamming the hawk");

    },

    hide_card: function(card_obj, delay) {
        delay = delay == undefined ? 0 : delay;

        var hide_with_scale = function() {
            card_obj.scale.x = 0;
        };

        var hide_tween = new TWEEN.Tween(card_obj.position).to({
            y: -1000
        }).easing(TWEEN.Easing.Cubic.In).onComplete(hide_with_scale);


        hide_tween.delay(delay).start();

    },

    show_card: function(card_obj, delay) {
        var show_tween = new TWEEN.Tween(card_obj.position).to({
            y: 0
        }).easing(TWEEN.Easing.Cubic.Out);;


        card_obj.scale.x = 1;
        show_tween.delay(delay).start();
    },

    show_profile: function() {
        this.show_card(this.profile_card_obj, 200);
    },

    hide_profile: function() {
        this.hide_card(this.profile_card_obj, 200)
    },

    update_profile: function() {
        REQUESTS.get_position(STATE.sessionID, function(response) {
            STATE.profile_card_elem.leadersTextRegion.innerHTML = response["data"]["leaders"];
            STATE.profile_card_elem.onParTextRegion.innerHTML = response["data"]["same"];
            STATE.profile_card_elem.trailersTextRegion.innerHTML = response["data"]["trailers"];
        });

        REQUESTS.get_player_info(STATE.sessionID, function(response) {
            STATE.profile_card_elem.profileNameTextRegion.innerHTML = response["data"]["NAME"];
            STATE.questionNumber = response["data"]["LEVEL"];
        });
    },
    show_hints: function() {
        this.show_card(this.hints_card_obj, 300);
    },

    update_hints: function() {
        REQUESTS.get_hints(STATE.sessionID, function(response) {
            if (response["data"].length === 0) {
                STATE.hints_card_elem.no_hints.style.display = "inline";
            } else {
                STATE.hints_card_elem.no_hints.style.display = "none";

            }

            for (var i = 0; i < response["data"].length; i++) {
                var hint = response["data"][i];
                console.log("~~hints: ", hint);
                STATE.hints_card_elem.hintTextRegion[i].innerHTML += hint;
            };

        });
    },

    hide_hints: function() {
        this.hide_card(this.hints_card_obj, 300);
        this.hide_card(this.rules_card_obj, 300);
    },


    logout: function() {
        //logout_button.disabled = true;
        this.profile_card_elem.logout_button.disabled = true;
        this.login_card_elem.login_button.disabled = false;
        STATE.sessionID = null;
    }

}


function create_css3d_obj(elem) {
    var cssObject = new THREE.CSS3DObject(elem);
    return cssObject;
}

function attach_ripple(elem) {
    var ripple = document.createElement("paper-ripple");
    elem.appendChild(ripple);
}

function create_input(label) {
    var input = document.createElement("paper-input");
    input.setAttribute("label", label);
    input.setAttribute("autocomplete", "on");
    return input;
}

function create_button(label) {
    var button = document.createElement("paper-button");
    //button.innerHTML = "Login";
    Polymer.dom(button).textContent = label;
    //button.setAttribute("raised", "true");
    return button;
}


function create_header(type, label) {
    var header = document.createElement(type);
    header.innerHTML = label;
    return header;
}

function create_progress() {
    var spinner = document.createElement("paper-progress");
    return spinner;
}

function create_question_card(response) {
    var card_paper = document.createElement("paper-material");
    var card_elem = document.createElement("div");
    card_elem.setAttribute("class", "card");
    card_paper.appendChild(card_elem);

    card_elem.setAttribute("class", "card");
    card_elem.setAttribute("elevation", "5");
    //attach_ripple(card_elem);
    var question_progress = create_progress();
    card_elem.appendChild(question_progress);


    var question_container = document.createElement("div");
    question_container.setAttribute("class", "question-container");
    card_elem.appendChild(question_container);

    var question_title = document.createElement("h1");
    question_title.innerHTML = "Level " + STATE.questionNumber;
    card_elem.question_title = question_title;
    question_container.appendChild(question_title);


    var content_region = document.createElement("div");
    content_region.setAttribute("class", "content-container");


    var question_text = response["data"]["questionText"];

    if (question_text != undefined) {
        content_region.innerHTML = question_text;
    };
    question_container.appendChild(content_region);


    var question_image_url = response["data"]["questionIMG"];

    var image_data_region = document.createElement("div");
    question_container.appendChild(image_data_region);

    if (question_image_url != "NA") {
        var image_url = document.createElement("a");
        image_url.setAttribute("href", "http://cyberhawk.iecsemanipal.com/api/uploads/" + question_image_url);
        image_url.setAttribute("target", "_blank");
        image_url.innerHTML = "http://cyberhawk.iecsemanipal.com/api/uploads/" + question_image_url;
        image_data_region.appendChild(image_url);

    };


    var submit_form = document.createElement("form");
    submit_form.action = "#";
    question_container.appendChild(submit_form);

    var answer_input = create_input("Answer");
    submit_form.appendChild(answer_input);

    var submit_button = create_button("Submit")
    submit_form.appendChild(submit_button);


    submit_form.onsubmit = submit_button.onclick = function(e) {
        e.preventDefault();
        var answer = answer_input.value.replace(/ /g, '').toUpperCase();
        answer_input.value = answer;

        if (answer === "") {
            console.log("the hawk dislikes empty answers");
        }

        STATE.try_answer(submit_button, question_progress, answer);
        //send answer request
        REQUESTS.answer(STATE.sessionID, answer, function(response) {

            if (response["data"] == "TOO-MANY-REQUESTS") {
                STATE.error_answer_too_many_req(submit_button, question_progress);
                return;
            };

            var correct = response["data"] === true;

            if (correct) {
                REQUESTS.get_question(STATE.sessionID, function(response) {
                    //var question = response["data"]["questionText"];
                    STATE.questionNumber = parseInt(STATE.questionNumber) + 1; //UPDATE Q NUMBER
                    var question_card = create_question_card(response);
                    STATE.switch_card_anim(question_card);
                    STATE.update_hints();
                });
            } else {
                STATE.error_answer(submit_button, question_progress);
            }
        });
    }

    var hidden_submit = document.createElement("input");
    hidden_submit.type = "submit";
    hidden_submit.hidden = true;
    submit_form.appendChild(hidden_submit);

    var card_obj = create_css3d_obj(card_elem);
    GLOBALS.cssScene.add(card_obj);

    //store it in STATE
    STATE.questioncard_obj = card_obj;
    STATE.questioncard_elem = card_elem;

    REQUESTS.get_player_info(STATE.sessionID, function(response) {
        var level_num_str = response["data"]["LEVEL"];
        STATE.questioncard_elem.question_title.innerHTML = "Level " + level_num_str;

        REQUESTS.get_question(STATE.sessionID, function(response_get_question) {
            var question_title = response_get_question["data"]["questionTitle"];
            if (question_title == "FALSE" || question_title == undefined) {
                document.title = "CyberHawk";

            } else {
                document.title = question_title;
            }
        });
    })


    return card_obj;

}

function create_login_card(cssScene) {
    var card_paper = document.createElement("paper-material");
    var card_elem = document.createElement("div");
    card_elem.setAttribute("class", "card");
    card_paper.appendChild(card_elem);
    attach_ripple(card_elem);

    var login_progress = create_progress();
    card_elem.appendChild(login_progress);
    card_elem.login_progress = login_progress;


    var login_form = document.createElement("form");
    login_form.action = "#";
    login_form.autocomplete = "on";
    login_form.setAttribute("class", "login-container");
    card_elem.appendChild(login_form)

    var header = create_header("h1", " CyberHawk");
    login_form.appendChild(header);

    var email_input = create_input("E-MAIL");
    login_form.appendChild(email_input);

    var password_input = create_input("PASSWORD");
    password_input.setAttribute("type", "password")
    login_form.appendChild(password_input);


    var hidden_submit = document.createElement("input");
    hidden_submit.type = "submit";
    hidden_submit.hidden = true;
    login_form.appendChild(hidden_submit);

    var login_button = create_button("Login");
    login_form.appendChild(login_button);
    card_elem.login_button = login_button;

    var goto_register_button = create_button("Register now");
    login_form.appendChild(goto_register_button);
    card_elem.goto_register_button = goto_register_button;


    goto_register_button.onclick = function() {
        STATE.switch_card_anim(STATE.register_card_obj);
    };
    //login onclick
    login_form.onsubmit = login_button.onclick = function(e) {
        e.preventDefault();
        STATE.try_login();

        if (email_input.value === "") {
            STATE.error_login("the hawk wants an e-mail ID");
            return;
        };
        if (password_input.value === "") {
            STATE.error_login("the hawk wants a password");
        };
        REQUESTS.login(email_input.value, password_input.value, function(response) {

            if (response["data"] === "PARAMS-INVALID" ||
                response["data"] === "LOGIN-INVALID" ||
                response["responseType"] === "apiError") {
                STATE.error_login("don't lie to the hawk");

            } else {
                console.log("response from login: ", response);
                STATE.sessionID = response["data"]["sessionID"];
                console.log("sessionID: ", STATE.sessionID);

                REQUESTS.get_question(STATE.sessionID, function(response) {
                    STATE.success_login();
                    //load the question
                    var question = response["data"]["questionText"];
                    var question_card = create_question_card(response);
                    //switch
                    STATE.switch_card_anim(question_card);
                    STATE.show_profile();
                    STATE.update_profile();
                    STATE.show_hints();
                    STATE.update_hints();

                });

            }
        });
    }

    var card_obj = create_css3d_obj(card_elem);
    GLOBALS.cssScene.add(card_obj);

    //store it in STATE
    STATE.login_card_obj = card_obj;
    STATE.login_card_elem = card_elem;

    card_obj.position.y = -1000;


    return card_obj;
}

function create_profile_card() {
    var card_elem = document.createElement("paper-material");
    card_elem.setAttribute("class", "card");
    card_elem.setAttribute("style", "width: 22%; height: 80%;");
    attach_ripple(card_elem);

    var profile_container = document.createElement("div");
    profile_container.setAttribute("class", "profile-container");
    card_elem.appendChild(profile_container);


    var profileNameTextRegion = create_header("h3", "Loading...");
    profileNameTextRegion.setAttribute("class", "profile-name");
    profile_container.appendChild(profileNameTextRegion);
    card_elem.profileNameTextRegion = profileNameTextRegion;

    var positionsContainer = document.createElement("div");
    profile_container.appendChild(positionsContainer);

    //leaders
    var leadersHeader = create_header("h3", "Leaders");
    leadersHeader.setAttribute("class", "profile-header");
    positionsContainer.appendChild(leadersHeader)

    var leadersTextRegion = create_header("h3", "0");
    leadersTextRegion.setAttribute("class", "profile-leaderboard-val");

    positionsContainer.appendChild(leadersTextRegion);
    card_elem.leadersTextRegion = leadersTextRegion;

    //onpar
    var onParHeader = create_header("h3", "On Par");
    onParHeader.setAttribute("class", "profile-header");
    positionsContainer.appendChild(onParHeader);

    var onParTextRegion = create_header("h4", "0");
    onParTextRegion.setAttribute("class", "profile-leaderboard-val");

    positionsContainer.appendChild(onParTextRegion);
    card_elem.onParTextRegion = onParTextRegion;


    //lagging
    var trailersHeader = create_header("h3", "Trailers");
    trailersHeader.setAttribute("class", "profile-header");
    positionsContainer.appendChild(trailersHeader);

    var trailersTextRegion = create_header("h4", "0");
    trailersTextRegion.setAttribute("class", "profile-leaderboard-val");

    positionsContainer.appendChild(trailersTextRegion);
    card_elem.trailersTextRegion = trailersTextRegion;



    var logout_button = create_button("Logout");
    profile_container.appendChild(logout_button);
    card_elem.logout_button = logout_button;

    var contact_points = document.createElement("h2");
    contact_points.innerHTML = "Contact:";
    contact_points.setAttribute("style", "margin-top:2em");
    profile_container.appendChild(contact_points);


    var contact_names;
    contact_names = document.createElement("h3");
    contact_names.innerHTML = "9742931741";
    profile_container.appendChild(contact_names);

    contact_names = document.createElement("h3");
    contact_names.innerHTML = "9008765043";
    profile_container.appendChild(contact_names);


    logout_button.onclick = function() {
        REQUESTS.logout(STATE.sessionID);
        STATE.logout();
        STATE.switch_card_anim(STATE.login_card_obj);
        STATE.hide_profile();

        STATE.hide_card(STATE.hints_card_obj);
        STATE.hide_card(STATE.rules_card_obj);
    }

    var card_obj = create_css3d_obj(card_elem);
    card_obj.position.y = -1000;
    card_obj.position.x = +1000;
    card_obj.position.z = -40;

    card_obj.rotation.y = deg2rad(-5);

    GLOBALS.cssScene.add(card_obj);

    STATE.profile_card_obj = card_obj;
    STATE.profile_card_elem = card_elem;



    return card_obj;
}

function create_hints_card() {
    var card_elem = document.createElement("paper-material");
    card_elem.setAttribute("class", "card");

    $(card_elem).click(function() {
        console.log("hints clicked");
        STATE.hide_card(STATE.hints_card_obj);
        STATE.show_card(STATE.rules_card_obj, 1000);
    });

    attach_ripple(card_elem);



    var hints_container = document.createElement("div");
    hints_container.setAttribute("class", "hints-container");
    card_elem.appendChild(hints_container);
    card_elem.hints_container = hints_container;

    var hints_header = create_header("h2", "Hints");
    hints_container.appendChild(hints_header);

    var no_hints = create_header("h4", "The hawk has no hints yet");
    hints_container.appendChild(no_hints);
    no_hints.style.display = "none";
    card_elem.no_hints = no_hints;

    card_elem.hintTextRegion = [];

    for (var i = 0; i < 3; i++) {
        var hintRegion = document.createElement("div");
        hintRegion.setAttribute("class", "hint-region");
        hints_container.appendChild(hintRegion);
        card_elem.hintTextRegion.push(hintRegion);
    }



    var card_obj = create_css3d_obj(card_elem);
    card_obj.position.y = -1000;
    card_obj.position.x = -300;
    card_obj.position.z = -40;

    card_obj.rotation.y = deg2rad(5);


    GLOBALS.cssScene.add(card_obj);

    STATE.hints_card_obj = card_obj;
    STATE.hints_card_elem = card_elem;
}

function create_rules_card() {
    var card_elem = document.createElement("paper-material");
    card_elem.setAttribute("class", "card");
    card_elem.setAttribute("style", "width: 25%; height: 80%");

    $(card_elem).click(function() {
        console.log("rules clicked");
        STATE.hide_card(STATE.rules_card_obj);
        STATE.show_card(STATE.hints_card_obj, 1000);
    });
    attach_ripple(card_elem);

    var rules_container = document.createElement("div");
    rules_container.setAttribute("class", "rules-container");
    card_elem.appendChild(rules_container);

    var rules_header = create_header("h1", "Rules");
    rules_container.appendChild(rules_header);


    var rules_bullet;

    rules_bullet = document.createElement("h3");
    rules_bullet.innerHTML = "One account per user. Participants have to be a student of an Indian Institute."
    rules_container.appendChild(rules_bullet);

    rules_bullet = document.createElement("h3");
    rules_bullet.innerHTML = "Multiple IDs, People playing in groups will be banned."
    rules_container.appendChild(rules_bullet);

    rules_bullet = document.createElement("h3");
    rules_bullet.innerHTML = "The Hawk hates numerals, only alphabets"
    rules_container.appendChild(rules_bullet);

    rules_bullet = document.createElement("h3");
    rules_bullet.innerHTML = "The Event Heads have the ultimate authority"
    rules_container.appendChild(rules_bullet);

    rules_bullet = document.createElement("h3");
    rules_bullet.innerHTML = "The answer of '1 cake' will be 'onecake'";
    rules_container.appendChild(rules_bullet);



    var card_obj = create_css3d_obj(card_elem);
    card_obj.position.z = -40;
    card_obj.position.y = -1000;
    card_obj.rotation.y = deg2rad(5);


    GLOBALS.cssScene.add(card_obj);

    STATE.rules_card_obj = card_obj;
    STATE.rules_card_elem = card_elem;
}

function create_register_card() {
    var card_paper = document.createElement("paper-card");
    card_paper.setAttribute("elevation", "5");
    card_paper.setAttribute("animatedShadow", "true");


    var card_elem = document.createElement("div");
    card_elem.setAttribute("class", "card");
    card_paper.appendChild(card_elem);
    attach_ripple(card_elem);

    var register_progress = create_progress();
    card_elem.appendChild(register_progress);
    card_elem.register_progress = register_progress;


    var register_form = document.createElement("form");
    register_form.action = "#";
    register_form.setAttribute("class", "register-container");
    card_elem.appendChild(register_form)

    var header = create_header("h1", "Register");
    register_form.appendChild(header);


    var name_input = create_input("NAME");
    register_form.appendChild(name_input);



    var password_input = create_input("PASSWORD");
    password_input.setAttribute("type", "password")
    register_form.appendChild(password_input);

    var password_resubmit_input = create_input("RETYPE PASSWORD");
    password_resubmit_input.setAttribute("type", "password")
    register_form.appendChild(password_resubmit_input);


    var email_input = create_input("E-MAIL");
    register_form.appendChild(email_input);


    var phone_input = create_input("PHONE NUMBER");
    register_form.appendChild(phone_input);


    var college_input = create_input("COLLEGE");
    register_form.appendChild(college_input);

    var hidden_submit = document.createElement("input");
    hidden_submit.type = "submit";
    hidden_submit.hidden = true;
    register_form.appendChild(hidden_submit);

    var register_button = create_button("Register");
    register_button.setAttribute("class", "spaced-button");
    register_form.appendChild(register_button);
    card_elem.register_button = register_button;


    var go_to_login_button = create_button("Go to Login");
    register_form.appendChild(go_to_login_button);
    card_elem.go_to_login_button = go_to_login_button;

    go_to_login_button.onclick = function() {
        STATE.switch_card_anim(STATE.login_card_obj);
    };

    //login onclick
    register_form.onsubmit = register_button.onclick = function(e) {
        e.preventDefault();

        STATE.try_register();

        var data = {};
        data["NAME"] = name_input.value;
        data["EMAIL"] = email_input.value;
        data["PASSWORD"] = password_input.value;
        data["COLLEGE"] = college_input.value;
        data["PHONE"] = phone_input.value;

        if (data["NAME"] === "") {
            STATE.error_register("the hawk expects a username");
            return;
        };

        if (data["PASSWORD"] === "") {
            STATE.error_register("the hawk expects a password");
            return;
        };
        var resubmit_password = password_resubmit_input.value;
        if (resubmit_password === "") {
            STATE.error_register("the hawk wishes for the password twice");
            return;

        }
        var simple_email_regex = /\S+@\S+\.\S+/;
        if (data["EMAIL"] === "" || !simple_email_regex.test(data["EMAIL"])) {
            STATE.error_register("the hawk wishes for a true E-mail id");
            return;
        };

        if (data["PASSWORD"] !== resubmit_password) {
            STATE.error_register("the passwords do not pass the hawk's check");
            return;
        }
        if (data["PHONE"] === "") {
            STATE.error_register("the hawk wishes to call you up sometime");
            return;
        }
        if (data["PHONE"].length != 10) {
            STATE.error_register("the hawk wishes for a 10 digit number");
        }
        if (data["COLLEGE"] === "") {
            STATE.error_register("the hawk wishes to know where you study");
            return;
        };



        REQUESTS.register(data, function(response) {
            if (response["data"] === "PARAMS-INVALID") {
                STATE.error_register("the hawk is unable to register you");


            } else if (response["data"] === "USER-EXISTS") {
                STATE.error_register("the hawk notices that you've already registered");
            } else if (response["data"] === null) {
                console.log("registered");
                STATE.success_register();
                STATE.switch_card_anim(STATE.login_card_obj);
            }
        });
    }

    var card_obj = create_css3d_obj(card_elem);
    GLOBALS.cssScene.add(card_obj);

    //store it in STATE
    STATE.register_card_obj = card_obj;
    STATE.register_card_elem = card_elem;

    STATE.top_card = card_obj;

    return card_obj;
}

function init() {
    //SETUP SCENE
    var cssScene = new THREE.Scene();
    GLOBALS.cssScene = cssScene;

    console.log("inner width: ", window.innerWidth, "inner height: ", window.innerHeight);


    var camera = null;
    var FOV_amount = 75;
    camera = new THREE.PerspectiveCamera(FOV_amount, window.innerWidth / window.innerHeight, 0.1, 1000);
    GLOBALS.camera = camera;

    camera.position.z = 550;
    var cssRenderer = new THREE.CSS3DRenderer();
    GLOBALS.cssRenderer = cssRenderer;

    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = 0;

    //cssRenderer.domElement.style.background = '#161928';
    //cssRenderer.domElement.style.background = '#EFEFEF';
    cssRenderer.domElement.style.background = '#111111';


    /*
    var canvas = cssRenderer.domElement;
    context = canvas.getContext("2d");
    img = new Image();

    img.src = 'https://www.google.nl/images/srpr/logo3w.png';

    img.onload = function() {
        for (var w = 0; w < canvas.width; w += img.width) {
            for (var h = 0; h < canvas.height; h += img.height) {
                context.drawImage(img, w, h);
            }
        }
    }
    */

    document.body.appendChild(cssRenderer.domElement);

    //SETUP TOAST
    GLOBALS.toastElement = document.createElement("paper-toast");
    GLOBALS.toastElement.setAttribute("z-index", "9999");
    GLOBALS.toastElement.setAttribute("id", "toast");
    GLOBALS.toastElement.setAttribute("duration", "7000");

    document.body.appendChild(GLOBALS.toastElement);


    create_register_card(cssScene);
    create_login_card(cssScene);
    create_profile_card(cssScene);
    create_hints_card(cssScene);
    create_rules_card(cssScene);

    function make_register_slide_up() {
        STATE.register_card_obj.position.y = -2000;
        var slide_up_tween = new TWEEN.Tween(STATE.register_card_obj.position).to({
            y: 0
        }).easing(TWEEN.Easing.Cubic.Out);
        slide_up_tween.start();
    };
    make_register_slide_up();

    function setup_request_handler_catch_all() {
        $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
            popup_toast("the hawk was unable to reach its nest");
        });
    };
    setup_request_handler_catch_all();


    function setup_hints_reload() {
        setTimeout(function() {
            if (STATE.sessionID != null) {
                STATE.update_hints();
            }
        }, 60 * 1000);
    };
    setup_hints_reload();

    function setup_profile_reload() {
        setTimeout(function() {
            if (STATE.sessionID != null) {
                STATE.update_profile();
            }
        }, 60 * 1000);
    };
    setup_profile_reload();


};


function create_spring(initial_val) {

    function setter_fn(value) {
        this.target = value;
    }

    function getter_fn(value) {
        return this.current;
    }

    function move_by_fn(value) {
        this.target = this.current + value;
    }

    function step_fn(t) {
        var dt = (t - this.t) / 1000.0;
        this.t = t;

        const step_time = 1.0 / 60.0;

        if (dt > step_time * 10) {
            dt = step_time;
        }

        while (dt > 0) {
            const m = 10;
            var x = this.current - this.target;

            var a = (-1.0 * x - 1. * this.v) * m;
            /*
            if (Math.abs(a) > 200) {
                a = 200 * (a < 0 ? -1 : 1);
            }
            */

            this.v += a * dt;
            /*
            if (Math.abs(this.v) > 400) {
                this.v = 400 * (this.v < 0 ? -1 : 1);
            }
            */

            this.current += this.v * dt + 0.5 * a * dt * dt;

            dt -= step_time;
        };
    }
    var spring_system = {
        target: initial_val,
        current: 0,
        v: 0,
        a: 0,
        t: 0,
    };

    spring_system.set = setter_fn.bind(spring_system);
    spring_system.get = getter_fn.bind(spring_system);
    spring_system.step = step_fn.bind(spring_system);
    spring_system.move_by = move_by_fn.bind(spring_system);
    return spring_system;
}

function create_mouse_position_tracker() {
    GLOBALS.mousePos = {
        x: create_spring(0),
        y: create_spring(0),
    };

    $(document).mousemove(function(event) {
        GLOBALS.mousePos.x.set(event.pageX);
        GLOBALS.mousePos.y.set(event.pageY);
    });

}

function create_gyro_position_tracker() {

    window.addEventListener("deviceorientation", function() {
        var absolute = event.absolute;
        var alpha = event.alpha;
        var x_axis = event.beta;
        var y_axis = event.gamma;

        //GLOBALS.mousePos.x.set(alpha / 5.0 * window.innerWidth);
    }, true);

    window.ondevicemotion = function(event) {
        var xVal = event.accelerationIncludingGravity.x;
        GLOBALS.mousePos.x.move_by(100 * xVal);
        //GLOBALS.mousePos.y.move_by(50 * yVal);
    }
};

var render = function(time) {
    requestAnimationFrame(render);
    const ROTATE_FACTOR = 0.1;

    if (!is_mobile()) {
        GLOBALS.camera.rotation.y = -ROTATE_FACTOR * (GLOBALS.mousePos.x.get() - window.innerWidth * 0.5) / window.innerWidth;
        GLOBALS.camera.rotation.x = -ROTATE_FACTOR * (GLOBALS.mousePos.y.get() - window.innerHeight * 0.5) / window.innerHeight;
    };
    //cssObject.rotation.x += 0.01
    GLOBALS.cssRenderer.render(GLOBALS.cssScene, GLOBALS.camera);
    GLOBALS.mousePos.x.step(time);
    GLOBALS.mousePos.y.step(time);
    TWEEN.update(time);
};

//onresize handler
window.addEventListener('polymer-ready', function(e) {
    console.log("polymer loaded!");
});;

setTimeout(function() {
    init();
    create_mouse_position_tracker();
    //create_gyro_position_tracker();

    window.onresize = function() {
        GLOBALS.camera.aspectRatio = window.innerWidth / window.innerHeight;
        GLOBALS.cssRenderer.setSize(window.innerWidth, window.innerHeight);


        STATE.profile_card_obj.position.x = 450;
        STATE.hints_card_obj.position.x = -450;
        STATE.rules_card_obj.position.x = -450;

        console.log("resized!");
    };



    window.onresize();
    render();
}, 400);
