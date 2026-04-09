import { useState, type CSSProperties } from "react";
import { FileUploadDropzone } from "../components/FileUploadDropzone";
import type { UploadOption } from "../components/FileUploadDropzone";
import { Icon } from "../components/Icon";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const rowStyle: CSSProperties = {
  display: "flex",
  gap: 24,
  flexWrap: "wrap",
  alignItems: "flex-start",
};

function DefaultDemo({ height }: { height?: number }) {
  return (
    <FileUploadDropzone
      hintText="Supported formats: PNG, JPG, PDF. Max 10 MB per file."
      onFiles={(files) => console.log("Files selected:", files)}
      style={height ? { height } : undefined}
    />
  );
}

function StatesDemo({ height }: { height?: number }) {
  const h = height ? { height } : undefined;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>Normal</p>
        <FileUploadDropzone hintText="Hint text" style={h} />
      </div>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Disabled
        </p>
        <FileUploadDropzone disabled hintText="Hint text" style={h} />
      </div>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>Error</p>
        <FileUploadDropzone errorText="File size exceeds the 10 MB limit." style={h} />
      </div>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Drag-over (drag a file onto this zone to see the overlay)
        </p>
        <FileUploadDropzone hintText="Try dragging a file over this area" style={h} />
      </div>
    </div>
  );
}

function CustomTextDemo({ height }: { height?: number }) {
  return (
    <FileUploadDropzone
      title="Upload your brand assets"
      description="SVG, PNG, or PDF up to 5 MB each"
      buttonLabel="Browse files"
      hintText="You can upload up to 20 files at once."
      style={height ? { height } : undefined}
    />
  );
}

function FileTypeFilterDemo({ height }: { height?: number }) {
  return (
    <FileUploadDropzone
      accept="image/*"
      title="Upload images"
      description="Only image files (PNG, JPG, GIF, WebP) are accepted"
      hintText="Only images"
      onFiles={(files) => console.log("Image files:", files)}
      style={height ? { height } : undefined}
    />
  );
}

function CustomIconDemo({ height }: { height?: number }) {
  const h = height ? { height } : undefined;
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
      <FileUploadDropzone
        icon={<Icon name="image" size={24} />}
        title="Upload images"
        description="Drag your photos here"
        hintText="Custom icon: image"
        style={h}
      />
      <FileUploadDropzone
        icon={<Icon name="backup" size={24} />}
        title="Backup your files"
        description="Cloud backup with custom icon"
        hintText="Custom icon: backup"
        style={h}
      />
    </div>
  );
}

function DropdownButtonDemo({ height }: { height?: number }) {
  const options: UploadOption[] = [
    {
      key: "computer",
      label: "Upload from computer",
      leading: <Icon name="upload" size={20} />,
      onSelect: (openFilePicker) => openFilePicker(),
    },
    {
      key: "asset-library",
      label: "Select from asset library",
      leading: <Icon name="image" size={20} />,
      onSelect: () => alert("Open asset library picker"),
    },
  ];

  return (
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          With dropdown (uploadOptions)
        </p>
        <FileUploadDropzone
          uploadOptions={options}
          hintText="Click the button to see the dropdown"
          onFiles={(files) => console.log("Files from dropdown:", files)}
          style={height ? { height } : undefined}
        />
      </div>
      <div style={{ flex: 1, minWidth: 280 }}>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Without dropdown (default)
        </p>
        <FileUploadDropzone
          hintText="Button directly opens the file picker"
          onFiles={(files) => console.log("Files direct:", files)}
          style={height ? { height } : undefined}
        />
      </div>
    </div>
  );
}

function SingleFileDemo({ height }: { height?: number }) {
  return (
    <FileUploadDropzone
      multiple={false}
      title="Upload a single document"
      description="Only one file can be uploaded at a time"
      hintText="Single file only"
      onFiles={(files) => console.log("Single file:", files[0])}
      style={height ? { height } : undefined}
    />
  );
}

function CallbackDemo({ height }: { height?: number }) {
  const [fileList, setFileList] = useState<string[]>([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <FileUploadDropzone
        hintText="Select or drop files to see them listed below"
        onFiles={(files) =>
          setFileList((prev) => [
            ...prev,
            ...files.map(
              (f) => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`
            ),
          ])
        }
        style={height ? { height } : undefined}
      />
      {fileList.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 8px" }}>
            Selected files:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
            {fileList.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
          <button
            onClick={() => setFileList([])}
            style={{ marginTop: 8, fontSize: 12, cursor: "pointer" }}
          >
            Clear list
          </button>
        </div>
      )}
    </div>
  );
}

export default function FileUploadDropzonePlayground() {
  const [heightInput, setHeightInput] = useState("");
  const height = heightInput ? Number(heightInput) : undefined;

  return (
    <>
      <h1>FileUploadDropzone</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <label htmlFor="dz-height" style={{ fontSize: 13, fontWeight: 600 }}>
          Dropzone height (px):
        </label>
        <input
          id="dz-height"
          type="number"
          min={0}
          placeholder="auto"
          value={heightInput}
          onChange={(e) => setHeightInput(e.target.value)}
          style={{ width: 100, padding: "4px 8px", fontSize: 13, borderRadius: 4, border: "1px solid #ccc" }}
        />
        {heightInput && (
          <button
            onClick={() => setHeightInput("")}
            style={{ fontSize: 12, cursor: "pointer" }}
          >
            Reset
          </button>
        )}
      </div>

      <section style={sectionStyle}>
        <h2>Default</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Standard dropzone with hint text and file callback.
        </p>
        <div style={cardStyle}>
          <DefaultDemo height={height} />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>States</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Normal, disabled, error, and drag-over states.
        </p>
        <div style={cardStyle}>
          <StatesDemo height={height} />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Custom Text</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Custom title, description, and button label.
        </p>
        <div style={cardStyle}>
          <CustomTextDemo height={height} />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Custom Icon</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Override the default upload icon via the icon prop.
        </p>
        <div style={cardStyle}>
          <CustomIconDemo height={height} />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>File Type Filter</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Only image files accepted via the accept prop.
        </p>
        <div style={{ ...cardStyle, ...rowStyle }}>
          <FileTypeFilterDemo height={height} />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Dropdown Button</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          With uploadOptions the button shows a chevron and opens a dropdown
          menu. Without it, the button directly opens the file picker.
        </p>
        <div style={cardStyle}>
          <DropdownButtonDemo height={height} />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Single File</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Multiple disabled — only one file at a time.
        </p>
        <div style={cardStyle}>
          <SingleFileDemo height={height} />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>onFiles Callback</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Logs selected files to a list below the dropzone.
        </p>
        <div style={cardStyle}>
          <CallbackDemo height={height} />
        </div>
      </section>
    </>
  );
}
