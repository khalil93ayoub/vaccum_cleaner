(function(){
  const firebaseConfig = {
    apiKey: "AIzaSyDBYtMrRsnfHS8QMz8UgMjVmrBJ92siSbU",
    authDomain: "vacuum-cleaner-e8857.firebaseapp.com",
    projectId: "vacuum-cleaner-e8857"
  };

  const productId = document.body.dataset.productId;
  const stripeUrl = document.body.dataset.stripeUrl;
  const videoSrc = document.body.dataset.videoSrc;
  const shouldDecreaseStock =
    document.body.dataset.decreaseStock === "true";

  if(!productId){
    return;
  }

  const buyButtons = [
    document.getElementById("buyBtn"),
    document.getElementById("buyBtnTop")
  ].filter(Boolean);

  function setActive(el){
    document
      .querySelectorAll(".thumb")
      .forEach(thumb => thumb.classList.remove("active"));

    if(el){
      el.classList.add("active");
    }
  }

  window.showImage = function(el, src){
    setActive(el);

    document.getElementById("mainMedia").innerHTML = `
      <img class="gallery-media" src="${src}">
    `;
  };

  window.showVideo = function(el){
    setActive(el);

    document.getElementById("mainMedia").innerHTML = `
      <video class="gallery-media" controls autoplay>
        <source src="${videoSrc}" type="video/mp4">
      </video>
    `;
  };

  const app = firebase.apps.length
    ? firebase.app()
    : firebase.initializeApp(firebaseConfig);

  const db = app.firestore();
  const productRef = db.collection("product").doc(productId);

  function setButtonText(text){
    buyButtons.forEach(button => {
      button.innerText = text;
    });
  }

  async function handleBuy(){
    try{
      if(!stripeUrl || stripeUrl.includes("YOUR_STRIPE_LINK")){
        alert("Checkout link is not configured.");
        return;
      }

      const doc = await productRef.get();
      const stock = doc.data().stock;

      if(stock <= 0){
        alert("Sold Out");
        return;
      }

      if(shouldDecreaseStock){
        setButtonText("Processing...");

        await productRef.update({
          stock: stock - 1
        });
      }

      window.location.href = stripeUrl;
    }catch(error){
      alert("Error");
    }
  }

  buyButtons.forEach(button => {
    button.addEventListener("click", handleBuy);
  });

  productRef.onSnapshot(doc => {
    const stockText = document.getElementById("stockText");

    if(!stockText || !doc.exists){
      return;
    }

    const stock = doc.data().stock;

    stockText.innerText =
      stock > 0
        ? `In stock: ${stock}`
        : "Out of stock";
  });

})();
