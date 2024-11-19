console.log("Script loaded")
// Get modal element and buttons
const modal = document.getElementById("carmodal");
const openmodalBtn = document.getElementById("openmodal");
const closemodalBtn = document.getElementById("closemodal");
     // Open modal on button click
openmodalBtn.addEventListener("click", () => {
        modal.style.display = "block";
});
    
        // Close modal on close button click
closemodalBtn.addEventListener("click", () => {
        modal.style.display = "none";
});
    
        // Close modal if clicked outside the modal content
window.addEventListener("click", (event) => {
if (event.target === modal) {
    modal.style.display = "none";
    }
});


// const findBtn = document.getElementById("find"); 
// findBtn.addEventListener("click",()=>{
            
//     })
