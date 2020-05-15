require(["modules/jquery-mozu", "hyprlive"],
function ($, Hypr) {
    $(document).ready(function () {
        // config if loaded from preload script on .hypr
        var mozuFullConfig = require.mozuData("config");
        var config = require.mozuData("config").config;
        var formId = config.customId || mozuFullConfig.definitionId;

        // body params
        var sourceEmail = config.email_from ? config.email_from : "system@deplabs.com",
            ccEmailAddresses = config.email_cc ? config.email_cc.split(',') : [],
            subjectdata = config.subject ? config.subject : "Empty subject",
            emailTemplate = config.form_email_template ? config.form_email_template : "Empty text",
            successMessage = config.form_success_message ? config.form_success_message : "Mail sent successfully",
            errorMessage = config.form_error_message ? config.form_error_message : "Error sending email";

        // this will look for a `data-custom-attribute` as name and get #id 
        // element values and substitute to the form

        updateValues();

        function updateValues(formId) {
            // this will look for a `data-custom-attribute` as name and get #id 
            // element values and substitute to the form

            $('#' + formId + ' input[data-custom-attribute]').each(function (idx, el) {
                var checkedElement = $('#' + el.name);
                var foundValue = $('#' + el.name).val();
                if (foundValue && foundValue !== '') {
                    el.value = foundValue;
                } else {
                    // we go deeeeeper   
                    // this particular case - find second-level radio buttons
                    checkedElement.find('input[type=radio]').each(function () {
                        if ($(this).prop('checked')) {
                            el.value = $(this).val();
                        }
                    });
                    // TODO: think of more universal usage
                }
                // change name values on keyup/change
                $('#' + el.name).bind('keyup change', function () {
                    el.value = $('#' + el.name).val();
                });
            });
        }

        $('.close').on('click', function () {
            $('.popup-overlay').fadeOut(200);
        });
        $('body').on('click', function () {
            $('.popup-overlay').fadeOut(200);
        });
        $('#contact-form-message').val('');

        function sendEmail(formId, recaptcha) {
            if (formId) {
                if ($('#' + formId).attr('data-sourceEmail') !== '') sourceEmail = $('#' + formId).attr('data-sourceEmail');
                ccEmailAddresses = $('#' + formId).attr('data-ccEmailAddresses').split(',');
                if ($('#' + formId).attr('data-ccEmailAddresses') === "") {
                    ccEmailAddresses = [];
                }
                if ($('#' + formId).attr('data-subjectdata') !== '') subjectdata = $('#' + formId).attr('data-subjectdata');
                if ($('#' + formId).attr('data-emailTemplate') !== '') emailTemplate = $('#' + formId).attr('data-emailTemplate');
                if ($('#' + formId).attr('data-successMessage') !== '') successMessage = $('#' + formId).attr('data-successMessage');
                if ($('#' + formId).attr('data-errorMessage') !== '') errorMessage = $('#' + formId).attr('data-errorMessage');
            }
            updateValues(formId);
            var replacedTemplate = emailTemplate;
            var replaceSubject = subjectdata;
            if (!formId || formId === null) formId = mozuFullConfig.definitionId;
            var formSerialize = $('#' + formId).serialize(),
                toEmailAddresses = new Array($('#' + formId + ' input[name="form-email"]').val()),
                formArray = $('#' + formId).serializeArray();

            // recoursively replace {%value%} with needed values
            formArray.forEach(function (el, idx) {
                var field = el.name;
                var value = el.value;
                if (value && value !== '') {
                    var regex = new RegExp("{" + field + "}", "gi");
                    replacedTemplate = replacedTemplate.replace(regex, value);
                    replaceSubject = replaceSubject.replace(regex, value);
                }
            });

            // form the data body
            var body = {
                "bccEmailAddresses": [],
                "ccEmailAddresses": ccEmailAddresses,
                "toEmailAddresses": toEmailAddresses,
                "bodyData": replacedTemplate ? replacedTemplate : emailTemplate,
                "bodyCharset": "UTF-8",
                "subjectdata": replaceSubject ? replaceSubject : subjectdata,
                "subjectCharset": "UTF-8",
                "sourceEmail": sourceEmail,
                "replyToAddresses": [sourceEmail]
            };

            $.ajax({
                url: '/email', // TODO: transfer to ARC
                method: 'POST',
                headers: {
                    "Content-Type": "application/json", // welp, that was the game changer in this request
                    "data": JSON.stringify(body),
                    "x-recaptcha-response": recaptcha,
                    "successMessage": successMessage,
                    "errorMessage": errorMessage
                }
            })
            .success(function (response) {
            var message = response.message;
            $('#'+formId+' .response-message').remove();
                if (response.statusCode == 200) {
                    $('#'+formId).append('<span class="response-message success">'+message+'</span>');
                    // $('.popup-overlay').fadeIn(200);
                } else {
                    $('#'+formId).append('<span class="response-message error">'+message+'</span>');
                    // $('.popup-overlay').fadeIn(200);
                }
            });
        }

        function validateForm(formId) {
            var resultMessage = '';
            $('#'+formId+' [required]').each(function(idx, input) {
                input = $(input);
                var fieldName = input.attr('placeholder');
                if (fieldName) fieldName = fieldName.replace('*', '');
                if (input.attr('type') == 'email') {
                    var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                    var is_email=re.test(input.val());
                    if (!is_email) resultMessage += ' Email is invalid.';
                } else {
                    if (input.is('select')) {
                        if (input.val() === 'none') {
                            resultMessage += ' '+fieldName+' field is required and cannot be empty.';
                        }
                    } else {
                        if (input.val() === '' || input.val() === null) {
                            resultMessage += ' '+fieldName+' field is required and cannot be empty.';
                        } else if (input.val().length < 3) {
                            resultMessage += ' '+fieldName+' is less than 3 symbols.';
                        }
                    }
                }
            });
            return resultMessage;
        }

        $(document).on('click', 'input[name="submit-email-form"]', function (e) {
            e.preventDefault();
            var customId = $(this).closest('form').attr('id');
            var validate = validateForm(customId);
            var recaptcha = window.grecaptcha.getResponse();

            if (validate === '' && recaptcha.length > 0) {
                sendEmail(customId, recaptcha);
            } else {
                $('#'+customId+' .response-message').remove();
                $('#'+customId).append('<span class="response-message error">'+validate+'</span>');
            }
        });
    });
});