import { useState } from "react";
import {
  Button,
  type ButtonSize,
  type ButtonType,
  type ButtonEmphasis,
} from "@sds/components/Button";
import { IconButton } from "@sds/components/IconButton";
import { ToggleButton, type ToggleButtonEmphasis } from "@sds/components/ToggleButton";
import { IconToggleButton } from "@sds/components/IconToggleButton";
import { Icon } from "@sds/components/Icon";
import type { IconName } from "@sds/components/Icon";

const SIZES: ButtonSize[] = ["sm", "md", "lg"];
const TYPES: ButtonType[] = [
  "brand",
  "neutral",
  "info",
  "success",
  "warning",
  "alert",
  "inverse",
];
const EMPHASES: ButtonEmphasis[] = ["high", "medium", "low"];

const ICON_OPTIONS: { label: string; value: IconName | "" }[] = [
  { label: "None", value: "" },
  { label: "favorite_fill", value: "favorite_fill" },
  { label: "add", value: "add" },
  { label: "arrow_forward", value: "arrow_forward" },
  { label: "check", value: "check" },
  { label: "close", value: "close" },
  { label: "edit", value: "edit" },
  { label: "delete", value: "delete" },
  { label: "search", value: "search" },
  { label: "settings", value: "settings" },
  { label: "download", value: "download" },
];

type Component = "button" | "icon-button" | "toggle-button" | "icon-toggle-button";
const TOGGLE_EMPHASES: ToggleButtonEmphasis[] = ["medium", "low"];

export default function ButtonPlayground() {
  const [component, setComponent] = useState<Component>("button");
  const [size, setSize] = useState<ButtonSize>("md");
  const [variant, setVariant] = useState<ButtonType>("brand");
  const [emphasis, setEmphasis] = useState<ButtonEmphasis>("high");
  const [disabled, setDisabled] = useState(false);
  const [label, setLabel] = useState("Label");
  const [leadingIcon, setLeadingIcon] = useState<IconName | "">("");
  const [trailingIcon, setTrailingIcon] = useState<IconName | "">("");
  const [iconBtnIcon, setIconBtnIcon] = useState<IconName>("favorite_fill");
  const [toggleChecked, setToggleChecked] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  const iconSize = size === "lg" ? 20 : 16;

  return (
    <div className="playground">
      <div className="component-switcher">
        <button
          className={`control-btn ${component === "button" ? "active" : ""}`}
          onClick={() => setComponent("button")}
        >
          Button
        </button>
        <button
          className={`control-btn ${component === "icon-button" ? "active" : ""}`}
          onClick={() => setComponent("icon-button")}
        >
          Icon Button
        </button>
        <button
          className={`control-btn ${component === "toggle-button" ? "active" : ""}`}
          onClick={() => setComponent("toggle-button")}
        >
          Toggle Button
        </button>
        <button
          className={`control-btn ${component === "icon-toggle-button" ? "active" : ""}`}
          onClick={() => setComponent("icon-toggle-button")}
        >
          Icon Toggle
        </button>
      </div>

      <div className="playground-layout">
        <div className="playground-preview">
          <div
            className={`preview-area ${component !== "toggle-button" && component !== "icon-toggle-button" && variant === "inverse" ? "preview-dark" : ""}`}
          >
            {component === "button" && (
              <Button
                size={size}
                variant={variant}
                emphasis={emphasis}
                disabled={disabled}
                leadingIcon={
                  leadingIcon ? (
                    <Icon name={leadingIcon} size={iconSize} />
                  ) : undefined
                }
                trailingIcon={
                  trailingIcon ? (
                    <Icon name={trailingIcon} size={iconSize} />
                  ) : undefined
                }
              >
                {label}
              </Button>
            )}
            {component === "icon-button" && (
              <IconButton
                size={size}
                variant={variant}
                emphasis={emphasis}
                disabled={disabled}
                icon={<Icon name={iconBtnIcon} size={iconSize} />}
                aria-label={iconBtnIcon}
              />
            )}
            {component === "toggle-button" && (
              <ToggleButton
                size={size}
                emphasis={emphasis as ToggleButtonEmphasis}
                checked={toggleChecked}
                onChange={setToggleChecked}
                disabled={disabled}
                leadingIcon={
                  leadingIcon ? (
                    <Icon name={leadingIcon} size={iconSize} />
                  ) : undefined
                }
                trailingIcon={
                  trailingIcon ? (
                    <Icon name={trailingIcon} size={iconSize} />
                  ) : undefined
                }
              >
                {label}
              </ToggleButton>
            )}
            {component === "icon-toggle-button" && (
              <IconToggleButton
                size={size}
                emphasis={emphasis as ToggleButtonEmphasis}
                checked={toggleChecked}
                onChange={setToggleChecked}
                disabled={disabled}
                icon={<Icon name={iconBtnIcon} size={iconSize} />}
                aria-label={iconBtnIcon}
              />
            )}
          </div>
        </div>

        <div className="playground-controls">
          {(component === "button" || component === "toggle-button") && (
            <div className="control-group">
              <label className="control-label">Label</label>
              <input
                type="text"
                className="control-input"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          )}

          {component === "icon-toggle-button" && (
            <div className="control-group">
              <label className="control-label">Icon</label>
              <select
                className="control-select"
                value={iconBtnIcon}
                onChange={(e) => setIconBtnIcon(e.target.value as IconName)}
              >
                {ICON_OPTIONS.filter((o) => o.value !== "").map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="control-group">
            <label className="control-label">Size</label>
            <div className="control-options">
              {SIZES.map((s) => (
                <button
                  key={s}
                  className={`control-btn ${size === s ? "active" : ""}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {component !== "toggle-button" && component !== "icon-toggle-button" && (
            <div className="control-group">
              <label className="control-label">Type</label>
              <div className="control-options">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    className={`control-btn ${variant === t ? "active" : ""}`}
                    onClick={() => setVariant(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="control-group">
            <label className="control-label">Emphasis</label>
            <div className="control-options">
              {(component === "toggle-button" || component === "icon-toggle-button" ? TOGGLE_EMPHASES : EMPHASES).map(
                (e) => (
                  <button
                    key={e}
                    className={`control-btn ${emphasis === e ? "active" : ""}`}
                    onClick={() => setEmphasis(e as ButtonEmphasis)}
                  >
                    {e}
                  </button>
                )
              )}
            </div>
          </div>

          {(component === "button" || component === "toggle-button") && (
            <>
              <div className="control-group">
                <label className="control-label">Leading Icon</label>
                <select
                  className="control-select"
                  value={leadingIcon}
                  onChange={(e) =>
                    setLeadingIcon(e.target.value as IconName | "")
                  }
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label className="control-label">Trailing Icon</label>
                <select
                  className="control-select"
                  value={trailingIcon}
                  onChange={(e) =>
                    setTrailingIcon(e.target.value as IconName | "")
                  }
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {component === "icon-button" && (
            <div className="control-group">
              <label className="control-label">Icon</label>
              <select
                className="control-select"
                value={iconBtnIcon}
                onChange={(e) => setIconBtnIcon(e.target.value as IconName)}
              >
                {ICON_OPTIONS.filter((o) => o.value !== "").map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(component === "toggle-button" || component === "icon-toggle-button") && (
            <div className="control-group">
              <label className="control-toggle">
                <input
                  type="checkbox"
                  checked={toggleChecked}
                  onChange={(e) => setToggleChecked(e.target.checked)}
                />
                <span>Checked</span>
              </label>
            </div>
          )}

          <div className="control-group">
            <label className="control-toggle">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />
              <span>Disabled</span>
            </label>
          </div>

          <div className="control-group">
            <label className="control-toggle">
              <input
                type="checkbox"
                checked={showMatrix}
                onChange={(e) => setShowMatrix(e.target.checked)}
              />
              <span>Show full matrix</span>
            </label>
          </div>
        </div>
      </div>

      {showMatrix && (component === "button" || component === "icon-button") && (
        <div className="matrix">
          <h3 className="matrix-title">All Variants</h3>
          {EMPHASES.map((emp) => (
            <div key={emp} className="matrix-section">
              <h4 className="matrix-subtitle">Emphasis: {emp}</h4>
              <div className="matrix-grid">
                <div className="matrix-header" />
                {SIZES.map((s) => (
                  <div key={s} className="matrix-header">
                    {s}
                  </div>
                ))}
                {TYPES.map((t) => (
                  <div key={t} className="matrix-row">
                    <div className="matrix-type-label">{t}</div>
                    {SIZES.map((s) => (
                      <div
                        key={s}
                        className={`matrix-cell ${t === "inverse" ? "matrix-cell-dark" : ""}`}
                      >
                        {component === "button" ? (
                          <Button size={s} variant={t} emphasis={emp}>
                            Label
                          </Button>
                        ) : (
                          <IconButton
                            size={s}
                            variant={t}
                            emphasis={emp}
                            icon={
                              <Icon
                                name="favorite_fill"
                                size={s === "lg" ? 20 : 16}
                              />
                            }
                            aria-label="favorite"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showMatrix && component === "toggle-button" && (
        <div className="matrix">
          <h3 className="matrix-title">All Variants</h3>
          {TOGGLE_EMPHASES.map((emp) => (
            <div key={emp} className="matrix-section">
              <h4 className="matrix-subtitle">Emphasis: {emp}</h4>
              <div className="matrix-grid">
                <div className="matrix-header" />
                {SIZES.map((s) => (
                  <div key={s} className="matrix-header">
                    {s}
                  </div>
                ))}
                {["unchecked", "checked", "disabled"].map((row) => (
                  <div key={row} className="matrix-row">
                    <div className="matrix-type-label">{row}</div>
                    {SIZES.map((s) => (
                      <div key={s} className="matrix-cell">
                        <ToggleButton
                          size={s}
                          emphasis={emp}
                          checked={row === "checked"}
                          disabled={row === "disabled"}
                        >
                          Label
                        </ToggleButton>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showMatrix && component === "icon-toggle-button" && (
        <div className="matrix">
          <h3 className="matrix-title">All Variants</h3>
          {TOGGLE_EMPHASES.map((emp) => (
            <div key={emp} className="matrix-section">
              <h4 className="matrix-subtitle">Emphasis: {emp}</h4>
              <div className="matrix-grid">
                <div className="matrix-header" />
                {SIZES.map((s) => (
                  <div key={s} className="matrix-header">
                    {s}
                  </div>
                ))}
                {["unchecked", "checked", "disabled"].map((row) => (
                  <div key={row} className="matrix-row">
                    <div className="matrix-type-label">{row}</div>
                    {SIZES.map((s) => (
                      <div key={s} className="matrix-cell">
                        <IconToggleButton
                          size={s}
                          emphasis={emp}
                          checked={row === "checked"}
                          disabled={row === "disabled"}
                          icon={
                            <Icon
                              name="favorite_fill"
                              size={s === "lg" ? 20 : 16}
                            />
                          }
                          aria-label="favorite"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
