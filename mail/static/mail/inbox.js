document.addEventListener('DOMContentLoaded', function() {

    //1 Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', () => compose_email("new"));



    //1a By default, load the inbox
    load_mailbox('inbox');

    //1b on submitting an email the entered data is sent via json to the provided API url
    document.querySelector('#compose-form').onsubmit = () => {
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector("#compose-recipients").value,
                subject: document.querySelector("#compose-subject").value,
                body: document.querySelector("#compose-body").value
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        load_mailbox('sent');
        return false;
    };
});


//2. Compose emails
function compose_email(email_id) {

    //2a Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-section').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector("#email-details").style.display = "none";

    //2b Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    //2c on selecting the "reply" button the compose view is prepopulated with values
    fetch("emails/" + email_id)
    .then(response => response.json())
    .then(email => {
        document.querySelector('#compose-recipients').value = email["sender"]
        if (email["subject"].charAt(0) === "R" && email["subject"].charAt(1) === "e" && email["subject"].charAt(2) === ":"){
        document.querySelector('#compose-subject').value = email["subject"];
        }
        else{
        document.querySelector('#compose-subject').value = 'Re: ' + email["subject"];
        }
        document.querySelector('#compose-body').value = "On " + email["timestamp"]  + ", " + email["sender"] + " wrote: " + email["body"];

    })
}




//3 Selecting a tab shows a list of emails associated with that tab ------------------------
function load_mailbox(mailbox) {

    //3a Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#email-section').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector("#email-details").style.display = "none";

    //3b Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


    //3c If the tab selected is the "inbox" tab the emails shown are inbox emails using get response
    if (mailbox === "inbox"){
        fetch('emails/inbox')
        .then(response => response.json())
        .then(emails => {

            document.querySelector('#email-section').innerHTML = "";
            for(var i= 0; i<emails.length; i++){
            console.log(emails[i]["id"])
                var mail = document.createElement("div");

                //3d Assigning the email id to the created element id was the key to passing it to other function calls as API route requests
                //The innerhtml is populated with the sender the email and the timestamp.
                mail.setAttribute("id", emails[i]["id"])
                mail.setAttribute("class", "mail_box");

                mail.innerHTML = emails[i]["sender"] + "<span class=\"mail_spaces\">" + emails[i]["subject"] + "<span class=\"mail_spaces\">" + emails[i]["timestamp"];
                document.querySelector('#email-section').append(mail);

                //3e Here we alter the background of an email based on if the email is read or unread
                if(emails[i]["read"] === true){
                    document.getElementById(emails[i]["id"]).style.background =  "#a6acaf";
                }
                else{
                    document.getElementById(emails[i]["id"]).style.background =  "white";
                }
            }
            //3f On clicking an email, a string concatenation of the email id (initialized to element id see"3d") and an origin identifying string is passed as a variable to the read_mail function
            document.querySelectorAll(".mail_box").forEach(mail_box => {
                mail_box.addEventListener('click', () => read_mail("inb" + mail_box.id))
            })
        });
    }


    //3g If the tab selected is the "sent" tab the emails shown are the sent emails using a fetch get API call
    if (mailbox === "sent"){
        fetch('emails/sent')
        .then(response => response.json())
        .then(emails => {
            document.querySelector('#email-section').innerHTML = "";
            for(var j= 0; j<emails.length; j++){
                var mail = document.createElement("div");
                mail.setAttribute("class", "mail_box");
                mail.setAttribute("id", emails[j]["id"])
                mail.innerHTML = emails[j]["sender"] + "<span class=\"mail_spaces\">" + emails[j]["subject"] + "<span class=\"mail_spaces\">" + emails[j]["timestamp"];
                document.querySelector('#email-section').append(mail);
            }
            //3h string concatenation passed (see 3f)
            document.querySelectorAll(".mail_box").forEach(mail_box => {
            mail_box.addEventListener('click', () => read_mail("snt" + mail_box.id))
            })
        });
    }


    //3i If the tab selected is the "archive" tab the emails shown are archived emails using get response
    if (mailbox === "archive"){
        fetch('emails/archive')
        .then(response => response.json())
        .then(emails => {
            document.querySelector('#email-section').innerHTML = "";
            for(var k= 0; k<emails.length; k++){
                var mail = document.createElement("div");
                mail.setAttribute("class", "mail_box");
                mail.setAttribute("id", emails[k]["id"])
                mail.innerHTML = emails[k]["sender"] + "<span class=\"mail_spaces\">" + emails[k]["subject"] + "<span class=\"mail_spaces\">" + emails[k]["timestamp"];
                document.querySelector('#email-section').append(mail);
            }
            //3j string concatenation passed (see 3f & 3h)
            document.querySelectorAll(".mail_box").forEach(mail_box => {
            mail_box.addEventListener('click', () => read_mail("arc" + mail_box.id))
            })
        });
    }
}




//4 Clicking an email opens it up and displays the contents--------------------------------
function read_mail(tab) {
    //4a Utilizing the slice function, we are able to retrieve the email id passed in and the origin identifying string
    var email_id = tab.slice(3)

    //4b With the email id available we are now able to retrieve email details at the emails/<int:email_id> API route in order to prepopulate a reply email with content
    document.querySelector('#reply_mail').addEventListener('click', () => compose_email(email_id));

    //4c Make Get request to obtain details of an email using the email id
    fetch("emails/" + email_id)
    .then(response => response.json())
    .then(email => {


        document.querySelector("#emails-view").style.display = "none";
        document.querySelector("#email-section").style.display = "none";
        document.querySelector("#email-details").style.display = "inline";


        //4d Insert content obtained from fetch API call into html span elements
        document.querySelector("#read_sender").innerHTML = email["sender"]
        document.querySelector("#read_recipients").innerHTML = email["recipients"]
        document.querySelector("#read_subject").innerHTML = email["subject"]
        document.querySelector("#read_timestamp").innerHTML = email["timestamp"]
        document.querySelector("#read_body").innerHTML = email["body"]
    })

    //4e Make Put request to alter email "read" attribute to true. As an email was clicked in order to reach this subfunction (see 3f, 3h & 3j)
    fetch("emails/" + email_id, {
        method: "PUT",
        body: JSON.stringify({
        read: true
        })
    })


    //4f Using the slice function we are able to recover the origin identifying information passed in previously. If the email selected was from the archive emails ('arc') the archive button is set to unarchive
    if (tab.slice(0, 3) === "arc"){
    document.querySelector("#set_archive").style.display = "inline";
    document.querySelector("#set_archive").innerHTML = "Unarchive";
    document.querySelector("#set_archive").onclick = () => {
    fetch("emails/" + email_id, {
        method: "PUT",
        body: JSON.stringify({
        archived: false
        })
    })
    load_mailbox('inbox');
    }}


    //4g If the email selected was from the inbox emails you are able to archive it
    else if (tab.slice(0, 3) === "inb"){
        document.querySelector("#set_archive").style.display = "inline";
        document.querySelector("#set_archive").innerHTML = "Archive";
        document.querySelector("#set_archive").onclick = () => {
            fetch("emails/" + email_id, {
                method: "PUT",
                body: JSON.stringify({
                    archived: true
                })
            })
            load_mailbox('inbox');
        }
    }


    //4h If the email selected is from the sent emails, the archive/unarchive option is not displayed
    else{
        document.querySelector("#set_archive").style.display = "none";
    }
}
