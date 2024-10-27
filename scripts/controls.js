import * as Generated from "./generate.js";

const ControlRodsLabel = document.getElementById('ControlRodsLabel');
const ControlRodInput = document.getElementById('ControlRodInput');
const CoolantLabel = document.getElementById('CoolantLabel');
const CoolantInput = document.getElementById('CoolantInput');

const ScramButton = document.getElementById('ScramButton');

const Step = 32;

window.addEventListener("wheel", (Event) => {
    const delta = Event.deltaY > 0 ? Step : -Step;
    Generated.ControlRods.forEach(ControlRod => {
        const newOffset = ControlRod.offsetTop + delta;
        ControlRod.style.top = `${Math.min(0, Math.max(-384, newOffset))}px`;
    });
});

ControlRodInput.addEventListener('input', () => {
    const height = Math.max(0, -ControlRodInput.value * 2);
    SetRodsHeight(height);
});

ScramButton.addEventListener("click", () => {
    SetRodsHeight(0);
    CoolantInput.value = 100;
    window.Coolant = 100;
    CoolantLabel.innerHTML = "Coolant Displacement: 100%";
    ControlRodInput.value = 0;
    ControlRodsLabel.innerHTML = "Control Rods: 0%";
});

export function SetRodsHeight(Height) {
    Generated.ControlRods.forEach(ControlRod => {
        ControlRod.style.top = `${Height}px`;
    });
}

export function SetRodHeight(RodId, Height) {
    Generated.ControlRods.forEach(ControlRod => {
        if (ControlRod.id === RodId) {
            ControlRod.style.top = `${Height}px`;
        }
    });
}

let OldCoolant = 50;
let OldControl = 50;

function Loop() {
    const NewCoolant = Number(CoolantInput.value);
    const NewControl = Number(ControlRodInput.value);

    CoolantLabel.innerHTML = `Coolant Displacement: ${NewCoolant}%`;
    window.Coolant = NewCoolant;
    ControlRodsLabel.innerHTML = `Control Rods: ${NewControl}%`;

    if (NewCoolant !== OldCoolant || NewControl !== OldControl) {
        SetRodsHeight(NewControl * -3);

        OldCoolant = NewCoolant;
        OldControl = NewControl;
    }

    requestAnimationFrame(Loop);
}

Loop();