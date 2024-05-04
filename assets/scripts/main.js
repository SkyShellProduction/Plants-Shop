const swiper = new Swiper(".plants-slider__block", {
  // Optional parameters
  direction: "horizontal",
  loop: true,
  autoplay: {
    delay: 5000,
  },
  speed: 500,
  // Navigation arrows
  navigation: {
    nextEl: ".plants-slider__next",
    prevEl: ".plants-slider__prev",
  },
  effect: "creative",
  creativeEffect: {
    prev: {
      shadow: true,
      translate: [0, 0, -400],
    },
    next: {
      translate: ["100%", 0, 0],
    },
  },
});

async function httpClient(url, method, params) {
  const baseUrl = location.origin;
  const f = await fetch(`${baseUrl}${url}`, {
    method,
    ...params,
  });
  if (f.ok) return await f.json();
  else throw new Error(`Cannot ${method} data from ${url}`);
}

const commonInputs = document.querySelectorAll(".common__input");
const notify = document.querySelector(".notify");

commonInputs.forEach((item) => {
  item.addEventListener("input", (e) => {
    const value = e.target.value;
    let rep = value.replace(/[!"#$%'+()*,\-.\/:№;<=>?[\\\]^_`{|}~]+$/gmu, "");
    const type = e.target.getAttribute("data-type");
    if (type && type === "phone") {
      rep = rep.replace(/\D/gmu, "");
    }
    e.target.value = rep;
  });
  item.addEventListener("change", (e) => {
    const val = e.target.value;
    e.target.value = val.trim();
  });
});

const footerForm = document.querySelector(".footer__form");
const footerFormInputs = [...footerForm.querySelectorAll(".footer__input")];

footerForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const phone = footerFormInputs.find((c) => c.hasAttribute("data-type"));
  const every = footerFormInputs.every((c) => c.value.length > 0);
  if (phone && every) {
    phone.classList.remove("invalid");
    if (phone.value.length < 9) {
      phone.classList.add("invalid");
      return;
    }
    const data = new FormData(this);
    this.reset();
    notify.textContent = "Ваши пожелания успешно отправлены!!!";
    notify.classList.add("active");
    setTimeout(() => {
      notify.classList.remove("active");
    }, 3000);
  }
});

const allPlants = [
  {
    id: 1,
    title: "Kaktus Plants",
    price: 850_000,
    amount: 0,
    image: "assets/images/featured-plant01.png",
  },
  {
    id: 2,
    title: "Landak Plants",
    price: 1_050_000,
    amount: 0,
    image: "assets/images/featured-plant02.png",
  },
  {
    id: 3,
    title: "Kecubung Plants One",
    price: 950_000,
    amount: 0,
    image: "assets/images/featured-plant03.png",
  },
  {
    id: 4,
    title: "Kecubung Plants Se",
    price: 850_000,
    amount: 0,
    image: "assets/images/featured-plant04.png",
  },
  {
    id: 5,
    title: "Kecubung Plants Trio",
    price: 750_000,
    amount: 0,
    image: "assets/images/featured-plant05.png",
  },
];

const busket = localStorage.getItem("busket");
let busketData = busket ? JSON.parse(busket) : [];

const addOrRemoveBusket = (id) => busketData.findIndex((c) => c.id === id);

const headerBusket = document.querySelector(".header__busket");
const headerIndicator = document.querySelector(".header__indicator");

const modal = document.querySelector(".modal");
const modalClose = modal.querySelector(".modal__close");
const modalContent = modal.querySelector(".modal__content");
const modalNoItems = modal.querySelector(".modal__no-items");
const modalItems = modal.querySelector(".modal__items");
const modalItemsData = modal.querySelector(".modal__items-data");
const modalForm = modal.querySelector(".modal__form");
const modalSuccess = modal.querySelector(".modal__success");
const modalTotalPrice = modal.querySelector(".modal__total-price output");
const modalFormInputs = [...modalForm.querySelectorAll(".modal__input")];
const modalsendBtn = modalForm.querySelector(".modal__btn-send");

modalForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const phone = modalFormInputs.find((c) => c.hasAttribute("data-type"));
  const name = modalFormInputs.find((c) =>
    c.classList.contains("modal__input-name")
  );
  const every = modalFormInputs.every((c) => c.value.length > 0);
  if (phone && every) {
    phone.classList.remove("invalid");
    if (phone.value.length < 9) {
      phone.classList.add("invalid");
      return;
    }
    const data = {
      data: busketData,
      phone: phone.value,
      name: name.value,
    };
    modalsendBtn.classList.add("loading");
    setTimeout(() => {
      this.reset();
      modalItems.classList.remove("active");
      modalSuccess.classList.add("active");
      busketData = [];
      localStorage.removeItem("busket");
      headerIndicator.textContent = busketData.length;
      drawFavourite();
    }, 1000);
  }
});

function updateTotalPrice() {
  if (modalTotalPrice) {
    const sum = busketData.reduce(
      (acc, item) => acc + item.price * item.amount,
      0
    );
    modalTotalPrice.textContent = sum.toLocaleString();
  }
}

function drawModalItems() {
  modalItemsData.innerHTML = "";
  busketData.forEach((item, idx) => {
    const modalItem = document.createElement("div");
    modalItem.classList.add("modal__item");

    const modalFlex = document.createElement("div");
    modalFlex.classList.add("modal__item-flex");

    modalItem.append(modalFlex);

    const image = document.createElement("img");
    image.classList.add("modal__item-img");
    image.src = item.image;
    image.alt = item.title;

    modalFlex.append(image);

    const title = document.createElement("h4");
    title.classList.add("modal__item-title");
    title.textContent = item.title;

    const buttonMinus = document.createElement("button");
    buttonMinus.classList.add("common__btn", "modal__btn-minus");
    buttonMinus.textContent = "-";

    buttonMinus.addEventListener("click", function (e) {
      e.preventDefault();
      if (busketData[idx].amount > 0) {
        busketData[idx].amount--;
        updateOneItemBusket(modalItemOutput, modalItemPrice, idx);
        updateTotalPrice();
        if (busketData[idx].amount === 0) {
          const plant = plantsDom.find(
            (c) => c.getAttribute("data-id") == busketData[idx].id
          );
          if (plant) {
            plant.textContent = buyText;
          }
          modalItem.remove();
          busketData.splice(idx, 1);
          if (busketData.length === 0) {
            modalItems.classList.remove("active");
            modalNoItems.classList.add("active");
          }
        }
        localStorage.setItem("busket", JSON.stringify(busketData));
      }
    });

    const modalItemOutput = document.createElement("output");
    modalItemOutput.classList.add("modal__item-output");

    const buttonPlus = document.createElement("button");
    buttonPlus.classList.add("common__btn", "modal__btn-plus");
    buttonPlus.textContent = "+";

    buttonPlus.addEventListener("click", function (e) {
      e.preventDefault();
      if (busketData[idx].amount < 10) {
        busketData[idx].amount++;
        updateOneItemBusket(modalItemOutput, modalItemPrice, idx);
        updateTotalPrice();
        localStorage.setItem("busket", JSON.stringify(busketData));
      }
    });

    const modalItemPrice = document.createElement("div");
    modalItemPrice.classList.add("modal__item-price");

    updateOneItemBusket(modalItemOutput, modalItemPrice, idx);

    modalFlex.append(buttonMinus);
    modalFlex.append(modalItemOutput);
    modalFlex.append(buttonPlus);
    modalFlex.append(modalItemPrice);

    modalItem.append(title);

    modalItemsData.append(modalItem);
    //   <div class="modal__item">
    //   <div class="modal__item-flex">
    //     <img src="assets/images/featured-plant01.png" alt="plant01" class="modal__item-img">
    //     <button class="common__btn modal__btn-minus">-</button>
    //     <output class="modal__item-output">1</output>
    //     <button class="common__btn modal__btn-plus">+</button>
    //     <div class="modal__item-price">0</div>
    //   </div>
    //   <h4 class="modal__item-title">Kaktus Plants</h4>
    // </div>
  });
  updateTotalPrice();
}

function updateOneItemBusket(itemOutput, itemPrice, idx) {
  itemOutput.textContent = busketData[idx].amount;
  itemPrice.textContent = (
    busketData[idx].amount * busketData[idx].price
  ).toLocaleString();
}

function openCloseModal(open = true) {
  const bool = open ? "add" : "remove";
  document.body.classList[bool]("hidden");
  modal?.classList[bool]("active");
  modalSuccess?.classList.remove("active");
  modalsendBtn?.classList.remove("loading");
  if (busketData.length) {
    modalItems?.classList[bool]("active");
    drawModalItems();
  } else {
    modalNoItems?.classList[bool]("active");
  }
}

headerBusket?.addEventListener("click", (e) => {
  e.preventDefault();
  openCloseModal();
});

modal?.addEventListener("click", () => openCloseModal(false));
modalClose?.addEventListener("click", () => openCloseModal(false));

modalContent?.addEventListener("click", (e) => {
  e.stopPropagation();
});

const buyText = "Купить";
const addedText = "Добавлено";
const plantsDom = [...document.querySelectorAll(".featured-plants__favourite")];
headerIndicator.textContent = busketData.length;

function drawFavourite() {
  const busketStartIds = busketData.map((c) => c.id);
  plantsDom.forEach((item) => {
    const id = item.getAttribute("data-id");
    if (id) {
      if (busketStartIds.includes(+id)) {
        item.textContent = addedText;
      } else {
        item.textContent = buyText;
      }
    }
  });
}

drawFavourite();

plantsDom.forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const id = this.getAttribute("data-id");
    if (id) {
      const bool = addOrRemoveBusket(+id);
      const text = bool !== -1 ? buyText : addedText;
      if (bool !== -1) {
        busketData.splice(bool, 1);
      } else {
        const data = allPlants.find((c) => c.id === +id);
        if (data) {
          busketData.push({ ...data, amount: 1 });
        }
      }
      headerIndicator.textContent = busketData.length;
      localStorage.setItem("busket", JSON.stringify(busketData));
      this.textContent = text;
    }
  });
});
