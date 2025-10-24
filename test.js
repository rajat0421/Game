try {
    let reportOnly = false;        
    let sendEmailFlag = true;
    let leaverscount = 0;

    // Deduped recipients (optional)
    var email = ["Ibrahim.Kubba@aware.com.au"];
    var email_subject = "2.11 - Aware Prod – Offboarding Cloud Admin Accounts ";
    var email_body = "Following Cloud Admin Accounts were Offboarded <br> <br>";

    const ENT = "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User";
    const IAN = "urn:ietf:params:scim:schemas:ian:2.0:User";

    const filter = null;  
    const startIndex = 1;
    const count = 50;

    const attributes = 'id,userName,displayName,active,urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:employeeNumber,urn:ietf:params:scim:schemas:ian:2.0:User:onPremisesDistinguishedName,extension_5597e6d554134a188bce6e2c1965f91f_adminDescription';

    log.info(`Script started`);
    let users = AAD.getUsers(null, null, null, attributes);
    log.info(`is users an array : ${Array.isArray(users)}, users count: ${users.length}`);

    for (let user of users) {
        if (
            user?.[IAN]?.onPremisesDistinguishedName?.includes("#Expired") &&
            user?.extension_5597e6d554134a188bce6e2c1965f91f_adminDescription?.includes("Off_By_Aquera") &&
            (user?.active === false)
        ) {
            for (let admin of users) {
                if (admin?.[ENT]?.employeeNumber === ('cad_' + user?.[ENT]?.employeeNumber)) {
                    if (admin?.active === true) {
                        log.info("Processing Admin " + (admin.displayName || admin.userName || admin.id));
                        log.info("offboarding Admin " + (admin.displayName || admin.userName || admin.id));

                        if (!reportOnly) {
                            AAD.deactivateUser(admin); // keep as-is if your SDK accepts the object
                            log.info("Disabling " + (admin.displayName || admin.userName || admin.id));

                            // Build update payload
                            let updateUserEntry = {};
                            updateUserEntry[ENT] = {};
                            updateUserEntry[ENT].manager = {};
                            updateUserEntry[ENT].manager.value = null;
                            updateUserEntry[IAN] = {};
                            updateUserEntry[IAN].adminDescription = "Off_By_Aquera";

                            //  Fix: pass (id, payload) to satisfy the deprecated signature
                            AAD.updateUser(admin.id, updateUserEntry);
                            leaverscount += 1;
                        }

                        email_body += "<br><b> - " + (admin.displayName || admin.userName || admin.id) + "</b><br><br>";
                    }
                }
            }
        }
    }

    if (sendEmailFlag && (leaverscount >= 1)) {
        // Note: You didn't open <html>, but most clients will ignore a lone closing tag.
        // You can remove this line or add a matching <html><body> at the start if you prefer.
        email_body += "</html>";
        utils.sendEmail(email, email_subject, email_body, 'html', 'noreply@aquera.com');
        log.info("Email sent to,  " + email.toString());
    }

} catch (error) {
    log.error("An error occurred: " + error.message);
    utils.sendEmail(
        ["Ibrahim.Kubba@aware.com.au"],
        "Error in Offboarding Script",
        "An error occurred during the offboarding process: " + error.message,
        'html',
        'noreply@aquera.com'
    );
}



[
  {
    schemas: [
      "urn:ietf:params:scim:schemas:core:2.0:User",
      "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
      "urn:ietf:params:scim:schemas:ian:2.0:User",
    ],
    id: "5dfa2132-dec2-4b66-98ea-86550312dd91",
    userName: "1dafiru@xyntra.com",
    emails: [
      { primary: true, type: "work", value: "dgtu3@devtmc.gac.toyota.com" },
    ],
    name: {
      familyName: "Test User 3",
      givenName: "Devgac",
      formatted: "Devgac Test User 3",
    },
    displayName: "Devgac Test User 3",
    userType: "Guest",
    active: true,
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {},
    "urn:ietf:params:scim:schemas:ian:2.0:User": {
      creationType: "Invitation",
      externalUserState: "PendingAcceptance",
      externalUserStateChangeDateTime: "2025-04-15T08:33:45Z",
      mailNickname: "dafiru",
      officeLocation: "Tower Bridge - SP",
      otherMails: ["dafiru@xyntra.com"],
      proxyAddresses: [
        "smtp:dafiru@xyntra.com",
        "SMTP:dgtu3@devtmc.gac.toyota.com",
      ],
      refreshTokensValidFromDateTime: "2025-04-15T08:33:45Z",
      securityIdentifier:
        "S-1-12-1-1576673586-1265032898-1434905240-2447184387",
      showInAddressList: false,
      signInSessionsValidFromDateTime: "2025-04-15T08:33:45Z",
      azureADUserPrincipalName:
        "1dafiru_xyntra.com#EXT#@aqueratest.onmicrosoft.com",
    },
    meta: {
      resourceType: "User",
      location: "Users/5dfa2132-dec2-4b66-98ea-86550312dd91",
      created: "2025-04-15T08:33:45Z",
    },
  },
];
