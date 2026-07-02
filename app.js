/* ==========================================
   ABBQ Waste Tracker
   app.js
   Version : 1.0
========================================== */

"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    try {

        UI.init();

        UI.showLoading();

        await DB.open();

        await Master.load();

        Master.bind();

        Camera.init();

        Input.init();

        History.init();

        await Dashboard.init();

        Export.init();

        UI.hideLoading();

        console.log("ABBQ Waste Tracker Ready");

    }

    catch(err){

        console.error(err);

        UI.hideLoading();

        UI.alertDialog(

            "Aplikasi gagal diinisialisasi.\n\n" +

            err.message

        );

    }

});