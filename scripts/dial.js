const Dials = Array.from(document.getElementsByTagName("dial"));
Dials.forEach(Dial => {
    const Suffix = Dial.getAttribute("suffix");
    let Value = parseFloat(Dial.getAttribute("value"));
    const Min = parseFloat(Dial.getAttribute("min"));
    const Max = parseFloat(Dial.getAttribute("max"));

    const Needle = document.createElement("img");
    Needle.src = "../images/Needle.svg";
    Dial.appendChild(Needle);

    const ValueLabel = document.createElement("div");
    ValueLabel.innerHTML = `${Value} ${Suffix}`;
    ValueLabel.classList.add("Label");
    Dial.appendChild(ValueLabel);

    const MinRadian = 0;
    const MaxRadian = (Math.PI * 2) - 1.25;

    const UpdateNeedle = () => {
        let Radians = (Value - Min) / (Max - Min) * Math.PI * 2;
        Radians = Math.max(MinRadian, Math.min(MaxRadian, Radians));
        Needle.style.transform = `rotate(${Radians - Math.PI / 2}rad)`;
    };

    UpdateNeedle();

    let OldValue = Value;
    function Loop() {
        const NewValue = parseFloat(Dial.getAttribute("value"));
        if (OldValue !== NewValue) {
            Value = NewValue;
            ValueLabel.innerHTML = `${Value} ${Suffix}`;
            UpdateNeedle();
            OldValue = Value;
        }

        requestAnimationFrame(Loop);
    }

    Loop();
});
