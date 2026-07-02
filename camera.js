const Camera = (() => {
let currentPhoto=null;
function init(){
 const input=document.getElementById("photoInput");
 if(input) input.addEventListener("change",selectPhoto);
 const removeBtn=document.getElementById("removePhotoBtn");
 if(removeBtn) removeBtn.addEventListener("click",clear);
}
async function selectPhoto(e){
 const file=e.target.files[0];
 if(!file)return;
 try{
  UI.showLoading();
  currentPhoto=await compress(file);
  preview(currentPhoto);
  UI.hideLoading();
 }catch(err){
  console.error(err);
  UI.hideLoading();
  UI.toast("Foto gagal diproses. Coba gunakan foto lain.","error");
 }
}
function compress(file){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=function(){
   const img=new Image();
   img.onload=function(){
    const canvas=document.createElement("canvas");
    let scale=Math.min(1,1280/img.width,1280/img.height);
    canvas.width=img.width*scale;
    canvas.height=img.height*scale;
    canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
    resolve(canvas.toDataURL("image/jpeg",0.75));
   };
   img.onerror=reject;
   img.src=reader.result;
  };
  reader.onerror=reject;
  reader.readAsDataURL(file);
 });
}
function preview(src){
 const img=document.getElementById("photoPreview");
 if(img){img.src=src;img.style.display="block";}
}
function get(){return currentPhoto;}
function set(src){currentPhoto=src;preview(src);}
function clear(){currentPhoto=null;const img=document.getElementById("photoPreview");if(img)img.src="";}
return {init,get,set,clear};
})();