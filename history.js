/* ==========================================
   ABBQ Waste Tracker
   history.js
   Version : 1.0
========================================== */

"use strict";

const History = (() => {

    let records = [];

    /* ======================================
       INIT
    ====================================== */

    function init() {

        const from = document.getElementById("fromDate");
        const to = document.getElementById("toDate");

        if (from) {

            from.value = Helper.today();

            from.addEventListener("change", load);

        }

        if (to) {

            to.value = Helper.today();

            to.addEventListener("change", load);

        }

        load();

    }

    /* ======================================
       LOAD
    ====================================== */

    async function load() {

        const from = document.getElementById("fromDate").value;

        const to = document.getElementById("toDate").value;

        if (from && to) {

            records = await DB.getWasteByDate(from, to);

        } else {

            records = await DB.getWaste();

        }

        render(records);

    }

    /* ======================================
       RENDER
    ====================================== */

    function render(data) {

        const container =
            document.getElementById("historyList");

        container.innerHTML = "";

        if (data.length === 0) {

            UI.empty("historyList", "Belum ada data");

            return;

        }

        data.sort((a, b) => b.updatedAt - a.updatedAt);

        data.forEach(item => {

            container.appendChild(createCard(item));

        });

    }

    /* ======================================
       CREATE CARD
    ====================================== */

    function previewWaste(item){
        let html = `
        <div class="preview-waste">
        <h3>${item.item}</h3>
        <p><b>Qty:</b> ${item.qty} ${item.uom}</p>
        <p><b>Tanggal:</b> ${Helper.formatDate(item.date)}</p>
        <p><b>Kategori:</b> ${item.category || "-"}</p>
        <p><b>Reason:</b> ${item.reason || "-"}</p>
        ${item.photo ? `<img src="${item.photo}" style="max-width:100%;border-radius:8px;">` : "<p>Tidak ada foto</p>"}
        </div>`;
        UI.preview(html);
    }

    function createCard(item) {

        const card = document.createElement("div");

        card.className = "history-card";

        card.innerHTML = `

        <div class="history-header">

            <strong>${item.item}</strong>

            <span>${item.qty} ${item.uom}</span>

        </div>

        <div class="history-body">

            <p><b>Tanggal :</b> ${Helper.formatDate(item.date)}</p>

            <p><b>Shift :</b> ${item.shift}</p>

            <p><b>Kategori :</b> ${item.category}</p>

            <p><b>Reason :</b> ${item.reason || "-"}</p>

            <p><b>Remark :</b> ${item.remark || "-"}</p>

        </div>

        <div class="history-footer">

            <button class="btnEdit">Edit</button>

            <button class="btnDelete">Delete</button>

            ${item.photo ? '<button class="btnPhoto">Preview</button>' : ''}

        </div>

        `;

        card.querySelector(".btnEdit")
            .addEventListener("click", () => {

                Input.edit(item.id);

            });

        card.querySelector(".btnDelete")
            .addEventListener("click", () => {

                remove(item.id);

            });

        if (item.photo) {

            card.querySelector(".btnPhoto")
                .addEventListener("click", () => {

                    previewWaste(item);

                });

        }

        return card;

    }

    /* ======================================
       DELETE
    ====================================== */

    async function remove(id) {

        const ok =
            UI.confirmDialog(
                "Hapus data ini?"
            );

        if (!ok) return;

        UI.showLoading();

        await DB.deleteWaste(id);

        UI.hideLoading();

        UI.toast("Data berhasil dihapus");

        load();

        if (typeof Dashboard !== "undefined") {

            Dashboard.load();

        }

    }

    /* ======================================
       RETURN
    ====================================== */

    return {

        init,

        load

    };

})();