const state = {
  registered: false,
  issued: false,
  balance: 0,
  retired: 0,
  issueable: 2731,
  mrvHash: "0x3cbcd3d5dc5901126ac241f1ed3001f0264beebca291d27549e5a8a42cc8e1ba"
};

const balance = document.querySelector("#balance");
const retired = document.querySelector("#retired");
const certificate = document.querySelector("#certificate");
const events = document.querySelector("#events");
const register = document.querySelector("#register");
const issue = document.querySelector("#issue");
const retire = document.querySelector("#retire");

document.querySelector("#hash").textContent = `${state.mrvHash.slice(0, 18)}...`;
document.querySelector("#issueable").textContent = `${state.issueable.toLocaleString("es-PE")} MACC`;

function txHash(label) {
  const seed = `${label}-${Date.now()}-${Math.random()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `0x${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

function addEvent(text) {
  const item = document.createElement("li");
  item.textContent = text;
  events.prepend(item);
}

function render() {
  balance.textContent = state.balance.toLocaleString("es-PE");
  retired.textContent = `${state.retired.toLocaleString("es-PE")} tCO2e retiradas`;
  issue.disabled = !state.registered || state.issued;
  retire.disabled = !state.issued || state.balance < 25;
}

register.addEventListener("click", () => {
  state.registered = true;
  register.disabled = true;
  addEvent(`Proyecto Manglar Azul registrado en contrato EVM. Tx ${txHash("register")}`);
  render();
});

issue.addEventListener("click", () => {
  state.issued = true;
  state.balance = state.issueable;
  addEvent(`Lote MRV emitido: ${state.issueable} MACC con hash ${state.mrvHash}. Tx ${txHash("issue")}`);
  render();
});

retire.addEventListener("click", () => {
  state.balance -= 25;
  state.retired += 25;
  const cert = txHash("certificate");
  certificate.textContent = `Hash certificado: ${cert}`;
  addEvent(`Retiro publico de 25 tCO2e para comprador demo. Certificado ${cert}`);
  render();
});

render();
