/* ==========================================
   ABBQ Waste Tracker
   input.js
   Version 1.0
========================================== */

"use strict";

const Input = (() => {

    let editMode = false;
    let editId = null;

    /* ======================================
       INIT
    ====================================== */

    function init() {

        const saveBtn = document.getElementById("saveBtn");

        if (saveBtn) {

            saveBtn.addEventListener("click", save);

        }

        const date = document.getElementById("inputDate");

        if (date) {

            date.value = Helper.today();

        }

    }

    /* ======================================
       VALIDASI
    ====================================== */

    function validate() {

        if (!Master.getSelected()) {

            UI.toast("Item waste belum dipilih. Silahkan pilih dari daftar suggestion.", "error");

            return false;

        }

        const qty = Number(document.getElementById("qty").value);

        if (qty <= 0) {

            UI.toast("Qty harus lebih dari 0", "error");

            return false;

        }

        return true;

    }

    /* ======================================
       BUILD OBJECT
    ====================================== */

    function buildData() {

        const item = Master.getSelected();

        if (!item) {
            throw new Error("ITEM_NOT_SELECTED");
        }

        return {

            pic: document.getElementById("pic")?.value || "",

            id: editMode ? editId : Helper.uuid(),

            wasteNo: editMode
                ? document.getElementById("wasteNo")?.value || ""
                : Helper.wasteNumber(),

            date: document.getElementById("inputDate").value,

            shift: document.getElementById("shift").value,

            code: item.code,

            item: item.name,

            uom: item.uom,

            qty: Number(

                document.getElementById("qty").value

            ),

            category:

                document.getElementById("category").value,

            reason:

                document.getElementById("reason").value.trim(),

            photo:

                Camera.get ? Camera.get() : null,

            createdAt:

                editMode ? undefined : Helper.now(),

            updatedAt:

                Helper.now()

        };

    }

    /* ======================================
       SAVE
    ====================================== */

    async function save() {

        try {

            if (!validate()) return;

            UI.showLoading();

            const data = buildData();

            if (editMode) {

                const old = await DB.getWasteById(editId);

                if (old && !data.createdAt) {

                    data.createdAt = old.createdAt;

                }

                await DB.updateWaste(data);

                UI.toast("Data berhasil diperbarui");

            } else {

                await DB.saveWaste(data);

                UI.toast("Waste berhasil disimpan");

            }

            reset();

            if (typeof History !== "undefined") {

                History.load();

            }

            if (typeof Dashboard !== "undefined") {

                Dashboard.load();

            }

            UI.hideLoading();

        }

        catch (err) {

            console.error(err);

            UI.hideLoading();

            UI.toast("Gagal menyimpan data: " + (err.message || "error"), "error");

        }

    }

    /* ======================================
       EDIT
    ====================================== */

    async function edit(id) {

        const data = await DB.getWasteById(id);

        if (!data) return;

        editMode = true;

        editId = data.id;

        document.getElementById("inputDate").value = data.date;
        document.getElementById("shift").value = data.shift;

        document.getElementById("searchItem").value = data.item;
        document.getElementById("itemCode").value = data.code;
        document.getElementById("itemName").value = data.item;
        document.getElementById("uom").value = data.uom;

        document.getElementById("qty").value = data.qty;
        document.getElementById("category").value = data.category;
        document.getElementById("reason").value = data.reason;
        document.getElementById("remark").value = data.remark;

        if (data.photo) {

            Camera.set && Camera.set(data.photo);

        }

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    /* ======================================
       RESET
    ====================================== */

    function reset() {

        editMode = false;

        editId = null;

        document.getElementById("inputDate").value = Helper.today();

        document.getElementById("searchItem").value = "";

        document.getElementById("itemCode").value = "";

        document.getElementById("itemName").value = "";

        document.getElementById("uom").value = "";

        document.getElementById("qty").value = "";

        document.getElementById("reason") && (document.getElementById("reason").value = "");

        document.getElementById("remark") && (document.getElementById("remark").value = "");

        if (document.getElementById("category")) document.getElementById("category").selectedIndex = 0;

        Camera.clear();

    }

    return {

        init,

        edit,

        reset,

        save

    };

})()