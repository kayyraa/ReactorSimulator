const Reactor = document.querySelector(".Reactor");

const PowerDial = document.getElementById("PowerDial");
const TempDial = document.getElementById("TempDial");
const PresDial = document.getElementById("PresDial");

const WaterRows = 13;
const WaterCols = 22;
const WaterCount = WaterRows * WaterCols + (Math.sqrt(WaterRows * WaterCols) / 9);

const ControlRodCount = WaterRows + 1;

const Waters = [];
const Fuels = [];
export const ControlRods = [];

let ActiveNeutrons = [];

for (let Index = 0; Index < WaterCount; Index++) {
    const Water = document.createElement("div");
    Water.classList.add("Water", String(Index));
    Water.id = String(Index);
    Water.setAttribute("Temp", "22");
    Reactor.appendChild(Water);

    const TempLabel = document.createElement("div");
    TempLabel.innerHTML = "22";
    TempLabel.classList.add("TempLabel");
    Water.appendChild(TempLabel);

    Waters.push({
        Object: Water,
        Label: TempLabel
    });
}

for (let Index = 0; Index < ControlRodCount - 1; Index++) {
    const ControlRod = document.createElement("div");
    ControlRod.classList.add("ControlRod", String(Index));
    ControlRod.id = String(Index);

    ControlRod.style.top = "-128px";
    ControlRod.style.left = `${3.995 * Index}vw`;

    Reactor.appendChild(ControlRod);
    ControlRods.push(ControlRod);
}

for (let Index = 0; Index < WaterCount; Index++) {
    if (Math.floor(Math.random() * 1.25) === 0) {
        const Fuel = document.createElement("div");
        Fuel.classList.add("Fuel", String(Index));
        Fuel.setAttribute("Temp", "22");
        Fuel.id = Waters[Index].Object.id;
        Waters[Index].Object.appendChild(Fuel);

        function Loop() {
            if (!Fuel.parentElement) return;
            if (Math.floor(Math.random() * 1001) === 1000) {
                LaunchNeutron(Fuel);
            }
            requestAnimationFrame(Loop);
        }

        Fuels.push(Fuel);
        Loop();
    }
}

function LaunchNeutron(Fuel) {
    const Sound = document.createElement("audio");
    Sound.src = "../audio/click.mp3";
    Sound.play();

    const Neutron = document.createElement("div");
    Neutron.classList.add("Neutron");
    Reactor.appendChild(Neutron);
    ActiveNeutrons.push(Neutron);

    const FuelRect = Fuel.getBoundingClientRect();
    const ReactorRect = Reactor.getBoundingClientRect();
    let NeutronX = FuelRect.left - ReactorRect.left + FuelRect.width / 2;
    let NeutronY = FuelRect.top - ReactorRect.top + FuelRect.height / 2;
    let VelocityX = (Math.random() - 0.5) * 20;
    let VelocityY = (Math.random() - 0.5) * 20;

    Neutron.style.position = "absolute";
    Neutron.style.left = `${NeutronX}px`;
    Neutron.style.top = `${NeutronY}px`;

    function NeutronLoop() {
        if (!Neutron.parentElement) return;

        NeutronX += VelocityX;
        NeutronY += VelocityY;

        if (NeutronX <= 0 || NeutronX >= Reactor.clientWidth) {
            VelocityX = -VelocityX;
        }
        if (NeutronY <= 0 || NeutronY >= Reactor.clientHeight) {
            VelocityY = -VelocityY;
        }

        Neutron.style.left = `${NeutronX}px`;
        Neutron.style.top = `${NeutronY}px`;

        if (Math.floor(Math.random() * 101) === 100) {
            Neutron.remove();
            ActiveNeutrons = ActiveNeutrons.filter(n => n !== Neutron);
            return;
        }

        const NeutronRect = Neutron.getBoundingClientRect();
        for (const ControlRod of ControlRods) {
            const ControlRodRect = ControlRod.getBoundingClientRect();
            if (
                NeutronRect.left < ControlRodRect.right &&
                NeutronRect.right > ControlRodRect.left &&
                NeutronRect.top < ControlRodRect.bottom &&
                NeutronRect.bottom > ControlRodRect.top
            ) {
                Neutron.remove();
                ActiveNeutrons = ActiveNeutrons.filter(n => n !== Neutron);
                return;
            }
        }

        for (const OtherFuel of Fuels) {
            if (OtherFuel !== Fuel) {
                const OtherFuelRect = OtherFuel.getBoundingClientRect();
                if (
                    NeutronRect.left < OtherFuelRect.right &&
                    NeutronRect.right > OtherFuelRect.left &&
                    NeutronRect.top < OtherFuelRect.bottom &&
                    NeutronRect.bottom > OtherFuelRect.top
                ) {
                    if (Math.floor(Math.random() * 2) === 1) {
                        const ParentWater = OtherFuel.parentElement;
                        ParentWater.setAttribute("Temp", "200");
                        
                        Neutron.remove();
                        ActiveNeutrons = ActiveNeutrons.filter(n => n !== Neutron);
                        LaunchNeutron(OtherFuel);
                        return;
                    }
                }
            }
        }

        requestAnimationFrame(NeutronLoop);
    }

    NeutronLoop();
}

function TemperatureLoop() {
    const NewTemps = [];
    const AmbientTemp = 22;
    const TransferRate = 0.05;

    Waters.forEach((Water, Index) => {
        let Temp = parseFloat(Water.Object.getAttribute("Temp"));

        let RedValue, GreenValue, BlueValue;
        if (Temp > 125) {
            RedValue = 255;
            GreenValue = 255;
            BlueValue = 255;
        } else {
            RedValue = Math.min(255, 100 + (Temp * 4));
            GreenValue = Math.min(255, 100 + (Temp / 2));
            BlueValue = Math.max(0, 255 - (Temp * 2));
        }

        Water.Object.style.backgroundColor = `rgb(${RedValue}, ${GreenValue}, ${BlueValue})`;
        Water.Label.innerHTML = Math.floor(Temp);

        if (Temp > AmbientTemp) {
            Temp -= window.Coolant / 100;
        }

        let TotalTemp = Temp;
        let WeightSum = 1;
        const MaxRadius = 3;

        for (let Radius = 1; Radius <= MaxRadius; Radius++) {
            const DecayFactor = 1 / Radius;
            const RightNeighbor = Index % WaterCols + Radius < WaterCols ? Waters[Index + Radius] : null;
            const LeftNeighbor = Index % WaterCols - Radius >= 0 ? Waters[Index - Radius] : null;
            const TopNeighbor = Index - Radius * WaterCols >= 0 ? Waters[Index - Radius * WaterCols] : null;
            const BottomNeighbor = Index + Radius * WaterCols < WaterCount ? Waters[Index + Radius * WaterCols] : null;

            if (RightNeighbor) {
                const RightTemp = parseFloat(RightNeighbor.Object.getAttribute("Temp"));
                TotalTemp += RightTemp * DecayFactor * TransferRate;
                WeightSum += DecayFactor * TransferRate;
            }
            if (LeftNeighbor) {
                const LeftTemp = parseFloat(LeftNeighbor.Object.getAttribute("Temp"));
                TotalTemp += LeftTemp * DecayFactor * TransferRate;
                WeightSum += DecayFactor * TransferRate;
            }
            if (TopNeighbor) {
                const TopTemp = parseFloat(TopNeighbor.Object.getAttribute("Temp"));
                TotalTemp += TopTemp * DecayFactor * TransferRate;
                WeightSum += DecayFactor * TransferRate;
            }
            if (BottomNeighbor) {
                const BottomTemp = parseFloat(BottomNeighbor.Object.getAttribute("Temp"));
                TotalTemp += BottomTemp * DecayFactor * TransferRate;
                WeightSum += DecayFactor * TransferRate;
            }
        }

        const AverageTemp = TotalTemp / WeightSum;
        TempDial.setAttribute("value", AverageTemp.toFixed(1));
        PresDial.setAttribute("value", (AverageTemp * 11.251).toFixed(1));
        PowerDial.setAttribute("value", (AverageTemp * 11.251 * 4).toFixed(1));
        NewTemps.push(AverageTemp);

        Water.Object.setAttribute("Temp", NewTemps[Index].toString());
    });

    setTimeout(TemperatureLoop, 50);
}

TemperatureLoop();