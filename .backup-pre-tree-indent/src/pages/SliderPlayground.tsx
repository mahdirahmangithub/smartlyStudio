import { useState } from "react";
import { Slider, type SliderMark } from "../components/Slider";
import { Icon } from "../components/Icon";

const sectionStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 12,
};

const cardStyle = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column" as const,
  gap: 24,
};

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const captionStyle = {
  fontSize: 12,
  color: "var(--text-neutral-secondary-default)",
  minWidth: 80,
  flexShrink: 0 as const,
};

const valueStyle = {
  fontSize: 12,
  color: "var(--text-neutral-tertiary-default)",
  width: 60,
  flexShrink: 0 as const,
  textAlign: "right" as const,
};

const DISCRETE_MARKS: SliderMark[] = [
  { value: 0 },
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 },
  { value: 5 },
  { value: 6 },
  { value: 7 },
  { value: 8 },
  { value: 9 },
  { value: 10 },
];

export default function SliderPlayground() {
  const [single, setSingle] = useState(40);
  const [singleSm, setSingleSm] = useState(60);
  const [rangeVal, setRangeVal] = useState<[number, number]>([20, 80]);
  const [rangeSmVal, setRangeSmVal] = useState<[number, number]>([30, 70]);
  const [discrete, setDiscrete] = useState(5);
  const [discreteRange, setDiscreteRange] = useState<[number, number]>([2, 8]);
  const [discreteHidden, setDiscreteHidden] = useState(3);
  const [vertVal, setVertVal] = useState(50);
  const [vertRange, setVertRange] = useState<[number, number]>([20, 70]);
  const [discreteVertical, setDiscreteVertical] = useState(4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40, maxWidth: 640 }}>
      <h2 style={{ margin: 0 }}>Slider</h2>

      {/* ── Continuous single ────────────────────── */}
      <section style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Continuous (single)</h3>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <span style={captionStyle}>lg</span>
            <div style={{ flex: 1 }}>
              <Slider value={single} onChange={setSingle} />
            </div>
            <span style={valueStyle}>{Math.round(single)}</span>
          </div>
          <div style={rowStyle}>
            <span style={captionStyle}>sm</span>
            <div style={{ flex: 1 }}>
              <Slider value={singleSm} onChange={setSingleSm} size="sm" />
            </div>
            <span style={valueStyle}>{Math.round(singleSm)}</span>
          </div>
        </div>
      </section>

      {/* ── With icons ───────────────────────────── */}
      <section style={sectionStyle}>
        <h3 style={{ margin: 0 }}>With leading/trailing icons</h3>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <span style={captionStyle}>lg</span>
            <div style={{ flex: 1 }}>
              <Slider
                value={single}
                onChange={setSingle}
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
            <span style={valueStyle}>{Math.round(single)}</span>
          </div>
          <div style={rowStyle}>
            <span style={captionStyle}>sm</span>
            <div style={{ flex: 1 }}>
              <Slider
                value={singleSm}
                onChange={setSingleSm}
                size="sm"
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
            <span style={valueStyle}>{Math.round(singleSm)}</span>
          </div>
        </div>
      </section>

      {/* ── Range ─────────────────────────────────── */}
      <section style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Range (two knobs)</h3>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <span style={captionStyle}>lg</span>
            <div style={{ flex: 1 }}>
              <Slider
                range
                value={rangeVal}
                onChange={setRangeVal}
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
            <span style={valueStyle}>{Math.round(rangeVal[0])}–{Math.round(rangeVal[1])}</span>
          </div>
          <div style={rowStyle}>
            <span style={captionStyle}>sm</span>
            <div style={{ flex: 1 }}>
              <Slider
                range
                value={rangeSmVal}
                onChange={setRangeSmVal}
                size="sm"
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
            <span style={valueStyle}>{Math.round(rangeSmVal[0])}–{Math.round(rangeSmVal[1])}</span>
          </div>
        </div>
      </section>

      {/* ── Discrete with markers ─────────────────── */}
      <section style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Discrete (with markers)</h3>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <span style={captionStyle}>lg single</span>
            <div style={{ flex: 1 }}>
              <Slider
                value={discrete}
                onChange={setDiscrete}
                min={0}
                max={10}
                step={1}
                marks={DISCRETE_MARKS}
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
            <span style={valueStyle}>{discrete}</span>
          </div>
          <div style={rowStyle}>
            <span style={captionStyle}>lg range</span>
            <div style={{ flex: 1 }}>
              <Slider
                range
                value={discreteRange}
                onChange={setDiscreteRange}
                min={0}
                max={10}
                step={1}
                marks={DISCRETE_MARKS}
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
            <span style={valueStyle}>{discreteRange[0]}–{discreteRange[1]}</span>
          </div>
          <div style={rowStyle}>
            <span style={captionStyle}>sm single</span>
            <div style={{ flex: 1 }}>
              <Slider
                value={discrete}
                onChange={setDiscrete}
                min={0}
                max={10}
                step={1}
                marks={DISCRETE_MARKS}
                size="sm"
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
            <span style={valueStyle}>{discrete}</span>
          </div>
        </div>
      </section>

      {/* ── Discrete without markers (snap only) ──── */}
      <section style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Discrete (no markers, snap only)</h3>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <span style={captionStyle}>lg</span>
            <div style={{ flex: 1 }}>
              <Slider
                value={discreteHidden}
                onChange={setDiscreteHidden}
                min={0}
                max={10}
                step={1}
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
            <span style={valueStyle}>{discreteHidden}</span>
          </div>
        </div>
      </section>

      {/* ── Disabled ──────────────────────────────── */}
      <section style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Disabled</h3>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <span style={captionStyle}>lg single</span>
            <div style={{ flex: 1 }}>
              <Slider
                defaultValue={40}
                disabled
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
          </div>
          <div style={rowStyle}>
            <span style={captionStyle}>lg range</span>
            <div style={{ flex: 1 }}>
              <Slider
                range
                defaultValue={[20, 70]}
                disabled
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
          </div>
          <div style={rowStyle}>
            <span style={captionStyle}>sm single</span>
            <div style={{ flex: 1 }}>
              <Slider
                defaultValue={60}
                disabled
                size="sm"
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
          </div>
          <div style={rowStyle}>
            <span style={captionStyle}>lg discrete</span>
            <div style={{ flex: 1 }}>
              <Slider
                defaultValue={5}
                disabled
                min={0}
                max={10}
                step={1}
                marks={DISCRETE_MARKS}
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
          </div>
          <div style={rowStyle}>
            <span style={captionStyle}>lg range disc.</span>
            <div style={{ flex: 1 }}>
              <Slider
                range
                defaultValue={[2, 8]}
                disabled
                min={0}
                max={10}
                step={1}
                marks={DISCRETE_MARKS}
                leadingIcon={<Icon name="volume_off" size={24} />}
                trailingIcon={<Icon name="volume_up" size={24} />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Vertical ──────────────────────────────── */}
      <section style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Vertical</h3>
        <div
          style={{
            ...cardStyle,
            flexDirection: "row",
            gap: 40,
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: 300 }}>
            <span style={captionStyle}>lg</span>
            <Slider
              value={vertVal}
              onChange={setVertVal}
              orientation="vertical"
              leadingIcon={<Icon name="volume_off" size={24} />}
              trailingIcon={<Icon name="volume_up" size={24} />}
            />
            <span style={valueStyle}>{Math.round(vertVal)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: 300 }}>
            <span style={captionStyle}>sm</span>
            <Slider
              value={vertVal}
              onChange={setVertVal}
              orientation="vertical"
              size="sm"
              leadingIcon={<Icon name="volume_off" size={24} />}
              trailingIcon={<Icon name="volume_up" size={24} />}
            />
            <span style={valueStyle}>{Math.round(vertVal)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: 300 }}>
            <span style={captionStyle}>range</span>
            <Slider
              range
              value={vertRange}
              onChange={setVertRange}
              orientation="vertical"
              leadingIcon={<Icon name="volume_off" size={24} />}
              trailingIcon={<Icon name="volume_up" size={24} />}
            />
            <span style={valueStyle}>{Math.round(vertRange[0])}–{Math.round(vertRange[1])}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: 300 }}>
            <span style={captionStyle}>discrete</span>
            <Slider
              value={discreteVertical}
              onChange={setDiscreteVertical}
              orientation="vertical"
              min={0}
              max={10}
              step={1}
              marks={DISCRETE_MARKS}
              leadingIcon={<Icon name="volume_off" size={24} />}
              trailingIcon={<Icon name="volume_up" size={24} />}
            />
            <span style={valueStyle}>{discreteVertical}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: 300 }}>
            <span style={captionStyle}>disabled</span>
            <Slider
              defaultValue={50}
              disabled
              orientation="vertical"
              leadingIcon={<Icon name="volume_off" size={24} />}
              trailingIcon={<Icon name="volume_up" size={24} />}
            />
          </div>
        </div>
      </section>

      {/* ── Custom format ─────────────────────────── */}
      <section style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Custom tooltip format</h3>
        <div style={cardStyle}>
          <SliderWithFormat />
        </div>
      </section>
    </div>
  );
}

function SliderWithFormat() {
  const [val, setVal] = useState(50);
  return (
    <div style={rowStyle}>
      <span style={captionStyle}>Percent</span>
      <div style={{ flex: 1 }}>
        <Slider
          value={val}
          onChange={setVal}
          formatValue={(v) => `${Math.round(v)}%`}
          leadingIcon={<Icon name="brightness_4" size={24} />}
          trailingIcon={<Icon name="brightness_7" size={24} />}
        />
      </div>
      <span style={valueStyle}>{Math.round(val)}%</span>
    </div>
  );
}
