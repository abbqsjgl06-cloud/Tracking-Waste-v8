/* ==========================================
   ABBQ Waste Tracker
   database.js
   Version 1.0
========================================== */

"use strict";

const DB = (() => {

    const DB_NAME = "ABBQ_WASTE_DB";

    const DB_VERSION = 1;

    let db = null;

    /* ======================================
       OPEN DATABASE
    ====================================== */

    function open() {

        return new Promise((resolve, reject) => {

            if (db) {

                resolve(db);

                return;

            }

            const request = indexedDB.open(

                DB_NAME,

                DB_VERSION

            );

            request.onerror = () => {

                reject(request.error);

            };

            request.onsuccess = () => {

                db = request.result;

                resolve(db);

            };

            request.onupgradeneeded = (event) => {

                db = event.target.result;

                createTables(db);

            };

        });

    }

    /* ======================================
       CREATE TABLES
    ====================================== */

    function createTables(database) {

        /* MASTER ITEM */

        if (

            !database.objectStoreNames.contains(

                "masterItems"

            )

        ) {

            const store =

                database.createObjectStore(

                    "masterItems",

                    {

                        keyPath: "code"

                    }

                );

            store.createIndex(

                "name",

                "name",

                {

                    unique: false

                }

            );

        }

        /* WASTE */

        if (

            !database.objectStoreNames.contains(

                "wasteRecords"

            )

        ) {

            const waste =

                database.createObjectStore(

                    "wasteRecords",

                    {

                        keyPath: "id"

                    }

                );

            waste.createIndex(

                "date",

                "date",

                {

                    unique: false

                }

            );

            waste.createIndex(

                "item",

                "item",

                {

                    unique: false

                }

            );

        }

        /* SETTINGS */

        if (

            !database.objectStoreNames.contains(

                "settings"

            )

        ) {

            database.createObjectStore(

                "settings",

                {

                    keyPath: "key"

                }

            );

        }

    }
    /* ======================================
       GET STORE
    ====================================== */

    async function store(name, mode = "readonly") {

        const database = await open();

        return database

            .transaction(

                name,

                mode

            )

            .objectStore(name);

    }
    async function saveWaste(data) {

        const s = await store(

            "wasteRecords",

            "readwrite"

        );

        return new Promise((resolve, reject) => {

            const request = s.put(data);

            request.onsuccess = () => resolve();

            request.onerror = () => reject(request.error);

        });

    }
    async function getWaste() {

        const s = await store(

            "wasteRecords"

        );

        return new Promise((resolve, reject) => {

            const request = s.getAll();

            request.onsuccess = () => {

                resolve(request.result);

            };

            request.onerror = () => {

                reject(request.error);

            };

        });

    }
    async function deleteWaste(id){

        const s = await store(

            "wasteRecords",

            "readwrite"

        );

        return new Promise((resolve,reject)=>{

            const request=s.delete(id);

            request.onsuccess=()=>resolve();

            request.onerror=()=>reject(request.error);

        });

    }
    async function saveMaster(items){

        const s = await store(

            "masterItems",

            "readwrite"

        );

        return Promise.all(

            items.map(item=>{

                return new Promise((resolve,reject)=>{

                    const r=s.put(item);

                    r.onsuccess=()=>resolve();

                    r.onerror=()=>reject();

                });

            })

        );

    }
    async function getMaster(){

        const s=await store("masterItems");

        return new Promise((resolve,reject)=>{

            const r=s.getAll();

            r.onsuccess=()=>resolve(r.result);

            r.onerror=()=>reject(r.error);

        });

    }
    return{

    open,

    saveWaste,

    updateWaste,

    deleteWaste,

    getWaste,

    getWasteById,

    getWasteByDate,

    saveMaster,

    getMaster,

    searchMaster,

    saveSetting,

    getSetting,

    backup,

    restore

};

})();
/* ======================================
   GET WASTE BY ID
====================================== */

async function getWasteById(id){

    const s = await store("wasteRecords");

    return new Promise((resolve,reject)=>{

        const r = s.get(id);

        r.onsuccess = ()=>resolve(r.result);

        r.onerror = ()=>reject(r.error);

    });

}
/* ======================================
   UPDATE WASTE
====================================== */

async function updateWaste(data){

    const s = await store(

        "wasteRecords",

        "readwrite"

    );

    return new Promise((resolve,reject)=>{

        const r = s.put(data);

        r.onsuccess = ()=>resolve();

        r.onerror = ()=>reject(r.error);

    });

}
/* ======================================
   FILTER DATE
====================================== */

async function getWasteByDate(from,to){

    const all = await getWaste();

    return all.filter(item=>{

        return item.date>=from &&

               item.date<=to;

    });

}
/* ======================================
   SEARCH MASTER
====================================== */

async function searchMaster(keyword){

    const master = await getMaster();

    keyword = keyword

        .toLowerCase()

        .trim();

    return master.filter(item=>{

        return (

            item.name

            .toLowerCase()

            .includes(keyword)

            ||

            item.code

            .toLowerCase()

            .includes(keyword)

        );

    });

}
/* ======================================
   SAVE SETTING
====================================== */

async function saveSetting(key,value){

    const s = await store(

        "settings",

        "readwrite"

    );

    return new Promise((resolve,reject)=>{

        const r=s.put({

            key,

            value

        });

        r.onsuccess=()=>resolve();

        r.onerror=()=>reject(r.error);

    });

}

/* ======================================
   GET SETTING
====================================== */

async function getSetting(key){

    const s=await store("settings");

    return new Promise((resolve,reject)=>{

        const r=s.get(key);

        r.onsuccess=()=>{

            if(r.result){

                resolve(r.result.value);

            }else{

                resolve(null);

            }

        };

        r.onerror=()=>reject(r.error);

    });

}
/* ======================================
   BACKUP
====================================== */

async function backup(){

    return{

        masterItems:

            await getMaster(),

        wasteRecords:

            await getWaste()

    };

}
/* ======================================
   RESTORE
====================================== */

async function restore(data){

    if(data.masterItems){

        await saveMaster(

            data.masterItems

        );

    }

    if(data.wasteRecords){

        for(const item of data.wasteRecords){

            await saveWaste(item);

        }

    }

}