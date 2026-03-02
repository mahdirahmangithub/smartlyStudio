import { useState, useCallback, type CSSProperties } from "react";
import { DataTable, dataTableStyles, type ColumnDef, type SortState } from "../components/DataTable";

/* ═══════════════════════════════════════════════════════════════
   Shared layout styles (mirrors other playground pages)
   ═══════════════════════════════════════════════════════════════ */

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
  overflow: "auto",
};
const tableStyle: CSSProperties = {
  maxHeight: 400,
};

/* ═══════════════════════════════════════════════════════════════
   Sample data
   ═══════════════════════════════════════════════════════════════ */

interface Employee {
  id: number;
  name: string;
  age: number;
  email: string;
  department: string;
  salary: number;
}

const EMPLOYEES: Employee[] = [
  { id: 1, name: "Alice Johnson", age: 32, email: "alice@example.com", department: "Engineering", salary: 95000 },
  { id: 2, name: "Bob Smith", age: 45, email: "bob@example.com", department: "Marketing", salary: 82000 },
  { id: 3, name: "Charlie Brown", age: 28, email: "charlie@example.com", department: "Engineering", salary: 78000 },
  { id: 4, name: "Diana Prince", age: 36, email: "diana@example.com", department: "Design", salary: 88000 },
  { id: 5, name: "Eve Martinez", age: 29, email: "eve@example.com", department: "Engineering", salary: 91000 },
  { id: 6, name: "Frank Lee", age: 52, email: "frank@example.com", department: "Marketing", salary: 110000 },
  { id: 7, name: "Grace Hopper", age: 41, email: "grace@example.com", department: "Design", salary: 96000 },
];

interface TreeRow {
  id: number;
  name: string;
  role: string;
  children?: TreeRow[];
}

const TREE_DATA: TreeRow[] = [
  {
    id: 1,
    name: "Engineering",
    role: "Department",
    children: [
      {
        id: 11,
        name: "Frontend",
        role: "Team",
        children: [
          { id: 111, name: "Alice", role: "Lead" },
          { id: 112, name: "Bob", role: "Developer" },
        ],
      },
      {
        id: 12,
        name: "Backend",
        role: "Team",
        children: [
          { id: 121, name: "Charlie", role: "Lead" },
          { id: 122, name: "Diana", role: "Developer" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Design",
    role: "Department",
    children: [
      { id: 21, name: "Eve", role: "Lead" },
      { id: 22, name: "Frank", role: "Designer" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   Sub-demos (stateful sections)
   ═══════════════════════════════════════════════════════════════ */

function CellStatesDemo() {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([2, 5]);

  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180 },
    { key: "age", title: "Age", dataIndex: "age", width: 80, align: "right" },
    { key: "email", title: "Email", dataIndex: "email", width: 240 },
    { key: "department", title: "Dept", dataIndex: "department", width: 130 },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      align: "right",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h4 style={{ margin: "0 0 8px" }}>Normal + Checked rows</h4>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Rows 2 &amp; 5 are pre-selected (checked). Hover any cell to see state change. Click to select/deselect.
        </p>
        <DataTable<Employee>
          columns={columns}
          dataSource={EMPLOYEES}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: (keys) => setSelectedKeys(keys),
          }}
          keyboardNavigation
        />
      </div>

      <div>
        <h4 style={{ margin: "0 0 8px" }}>Error rows</h4>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Rows with salary &lt; $85k are flagged as error. Hover to see the error hover state.
        </p>
        <DataTable<Employee>
          columns={columns}
          dataSource={EMPLOYEES}
          rowKey="id"
          rowError={(record) => record.salary < 85000}
          keyboardNavigation
        />
      </div>

      <div>
        <h4 style={{ margin: "0 0 8px" }}>Disabled rows</h4>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Marketing department rows are disabled — hover is suppressed and cursor changes.
        </p>
        <DataTable<Employee>
          columns={columns}
          dataSource={EMPLOYEES}
          rowKey="id"
          rowDisabled={(record) => record.department === "Marketing"}
          rowSelection={{
            selectedRowKeys: [1],
            onChange: () => {},
            getCheckboxProps: (record) => ({
              disabled: record.department === "Marketing",
            }),
          }}
        />
      </div>

      <div>
        <h4 style={{ margin: "0 0 8px" }}>Checked + Error + Disabled combined</h4>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Row 1 selected, row 3 error, row 6 disabled. Focus any cell (tab or click) to see the focus ring.
        </p>
        <DataTable<Employee>
          columns={columns}
          dataSource={EMPLOYEES}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: [1],
            onChange: () => {},
          }}
          rowError={(record) => record.id === 3}
          rowDisabled={(record) => record.id === 6}
          keyboardNavigation
        />
      </div>
    </div>
  );
}

function BasicDemo() {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180 },
    { key: "age", title: "Age", dataIndex: "age", width: 80, align: "right" },
    { key: "email", title: "Email", dataIndex: "email", width: 220 },
    { key: "department", title: "Dept", dataIndex: "department", width: 130 },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      align: "right",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={EMPLOYEES}
      rowKey="id"
    />
  );
}

/* ── RowSpan demo data (employees grouped by department) ── */

const ROWSPAN_DATA: Employee[] = [
  { id: 1, name: "Alice Johnson", age: 32, email: "alice@example.com", department: "Engineering", salary: 95000 },
  { id: 3, name: "Charlie Brown", age: 28, email: "charlie@example.com", department: "Engineering", salary: 78000 },
  { id: 5, name: "Eve Martinez", age: 29, email: "eve@example.com", department: "Engineering", salary: 91000 },
  { id: 2, name: "Bob Smith", age: 45, email: "bob@example.com", department: "Marketing", salary: 82000 },
  { id: 6, name: "Frank Lee", age: 52, email: "frank@example.com", department: "Marketing", salary: 110000 },
  { id: 4, name: "Diana Prince", age: 36, email: "diana@example.com", department: "Design", salary: 88000 },
  { id: 7, name: "Grace Hopper", age: 41, email: "grace@example.com", department: "Design", salary: 96000 },
];

const deptSpans = (() => {
  const map = new Map<number, number>();
  let i = 0;
  while (i < ROWSPAN_DATA.length) {
    const dept = ROWSPAN_DATA[i].department;
    let count = 1;
    while (i + count < ROWSPAN_DATA.length && ROWSPAN_DATA[i + count].department === dept) count++;
    map.set(i, count);
    for (let j = 1; j < count; j++) map.set(i + j, 0);
    i += count;
  }
  return map;
})();

function RowSpanDemo() {
  const columns: ColumnDef<Employee>[] = [
    {
      key: "department",
      title: "Department",
      dataIndex: "department",
      width: 130,
      onCell: (_record, index) => ({ rowSpan: deptSpans.get(index) }),
    },
    { key: "name", title: "Name", dataIndex: "name", width: 160 },
    { key: "age", title: "Age", dataIndex: "age", width: 80, align: "right" },
    { key: "email", title: "Email", dataIndex: "email", width: 220 },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      align: "right",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={ROWSPAN_DATA}
      rowKey="id"
    />
  );
}

/* ── ColSpan demo data (section header rows spanning all columns) ── */

interface ColSpanRow {
  id: number;
  name: string;
  age: number | null;
  email: string;
  department: string;
  salary: number | null;
  isSectionHeader?: boolean;
}

const COLSPAN_DATA: ColSpanRow[] = [
  { id: 100, name: "Engineering", age: null, email: "", department: "Engineering", salary: null, isSectionHeader: true },
  { id: 1, name: "Alice Johnson", age: 32, email: "alice@example.com", department: "Engineering", salary: 95000 },
  { id: 3, name: "Charlie Brown", age: 28, email: "charlie@example.com", department: "Engineering", salary: 78000 },
  { id: 5, name: "Eve Martinez", age: 29, email: "eve@example.com", department: "Engineering", salary: 91000 },
  { id: 200, name: "Marketing", age: null, email: "", department: "Marketing", salary: null, isSectionHeader: true },
  { id: 2, name: "Bob Smith", age: 45, email: "bob@example.com", department: "Marketing", salary: 82000 },
  { id: 6, name: "Frank Lee", age: 52, email: "frank@example.com", department: "Marketing", salary: 110000 },
  { id: 300, name: "Design", age: null, email: "", department: "Design", salary: null, isSectionHeader: true },
  { id: 4, name: "Diana Prince", age: 36, email: "diana@example.com", department: "Design", salary: 88000 },
  { id: 7, name: "Grace Hopper", age: 41, email: "grace@example.com", department: "Design", salary: 96000 },
];

const TOTAL_LEAF_COLS = 5;

function ColSpanDemo() {
  const columns: ColumnDef<ColSpanRow>[] = [
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      width: 160,
      onCell: (record) =>
        record.isSectionHeader
          ? { colSpan: TOTAL_LEAF_COLS, style: { fontWeight: 600, backgroundColor: "var(--element-divider-neutral-weak)" } }
          : {},
    },
    {
      key: "age",
      title: "Age",
      dataIndex: "age",
      width: 80,
      align: "right",
      onCell: (record) => (record.isSectionHeader ? { colSpan: 0 } : {}),
      render: (v: number | null) => v ?? "",
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      width: 220,
      onCell: (record) => (record.isSectionHeader ? { colSpan: 0 } : {}),
    },
    {
      key: "department",
      title: "Dept",
      dataIndex: "department",
      width: 130,
      onCell: (record) => (record.isSectionHeader ? { colSpan: 0 } : {}),
    },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      align: "right",
      onCell: (record) => (record.isSectionHeader ? { colSpan: 0 } : {}),
      render: (v: number | null) => (v != null ? `$${v.toLocaleString()}` : ""),
    },
  ];

  return (
    <DataTable<ColSpanRow>
      columns={columns}
      dataSource={COLSPAN_DATA}
      rowKey="id"
    />
  );
}

function GroupedHeaderDemo() {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180 },
    {
      key: "personal",
      title: "Personal Info",
      children: [
        { key: "age", title: "Age", dataIndex: "age", width: 80, align: "right" },
        { key: "email", title: "Email", dataIndex: "email", width: 220 },
      ],
    },
    {
      key: "work",
      title: "Work Info",
      children: [
        { key: "department", title: "Dept", dataIndex: "department", width: 130 },
        {
          key: "salary",
          title: "Salary",
          dataIndex: "salary",
          width: 120,
          align: "right",
          render: (v: number) => `$${v.toLocaleString()}`,
        },
      ],
    },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={EMPLOYEES}
      rowKey="id"
    />
  );
}

function SelectionDemo() {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [radioKey, setRadioKey] = useState<React.Key[]>([]);

  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180 },
    { key: "age", title: "Age", dataIndex: "age", width: 80 },
    { key: "department", title: "Dept", dataIndex: "department", width: 130 },
  ];

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 300 }}>
        <h4 style={{ margin: "0 0 8px" }}>Checkbox (multi-select)</h4>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Selected: {selectedKeys.length ? selectedKeys.join(", ") : "none"}
        </p>
        <DataTable<Employee>
          columns={columns}
          dataSource={EMPLOYEES.slice(0, 5)}
          rowKey="id"
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedKeys,
            onChange: (keys) => setSelectedKeys(keys),
            getCheckboxProps: (r) => ({ disabled: r.id === 3 }),
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 300 }}>
        <h4 style={{ margin: "0 0 8px" }}>Radio (single-select)</h4>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Selected: {radioKey.length ? radioKey[0] : "none"}
        </p>
        <DataTable<Employee>
          columns={columns}
          dataSource={EMPLOYEES.slice(0, 5)}
          rowKey="id"
          rowSelection={{
            type: "radio",
            selectedRowKeys: radioKey,
            onChange: (keys) => setRadioKey(keys),
          }}
        />
      </div>
    </div>
  );
}

function ExpandableDemo() {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180 },
    { key: "department", title: "Dept", dataIndex: "department", width: 130 },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      render: (v: number) => `$${v.toLocaleString()}`,
    },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={EMPLOYEES.slice(0, 5)}
      rowKey="id"
      expandable={{
        expandedRowRender: (record) => (
          <div style={{ padding: 12 }}>
            <strong>{record.name}</strong> — {record.email}
            <br />
            Age: {record.age}, Salary: ${record.salary.toLocaleString()}
          </div>
        ),
        rowExpandable: (record) => record.id !== 2,
      }}
    />
  );
}

function TreeDemo() {
  const columns: ColumnDef<TreeRow>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 250 },
    { key: "role", title: "Role", dataIndex: "role", width: 150 },
  ];

  return (
    <DataTable<TreeRow>
      columns={columns}
      dataSource={TREE_DATA}
      rowKey="id"
      expandable={{ defaultExpandedRowKeys: [1] }}
    />
  );
}

function SortingDemo() {
  const [sortState, setSortState] = useState<SortState | null>(null);

  const sorted = [...EMPLOYEES].sort((a, b) => {
    if (!sortState) return 0;
    const { columnKey, direction } = sortState;
    const av = a[columnKey as keyof Employee];
    const bv = b[columnKey as keyof Employee];
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return direction === "asc" ? cmp : -cmp;
  });

  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180, sortable: true },
    { key: "age", title: "Age", dataIndex: "age", width: 80, sortable: true, align: "right" },
    { key: "department", title: "Dept", dataIndex: "department", width: 130, sortable: true },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      sortable: true,
      align: "right",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
  ];

  return (
    <>
      <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
        Sort: {sortState ? `${sortState.columnKey} ${sortState.direction}` : "none"} — click headers to cycle
      </p>
      <DataTable<Employee>
        columns={columns}
        dataSource={sorted}
        rowKey="id"
        sortState={sortState}
        onSort={setSortState}
      />
    </>
  );
}

function ColumnResizeDefaultDemo() {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180, minWidth: 80 },
    { key: "age", title: "Age", dataIndex: "age", width: 80, minWidth: 50 },
    { key: "email", title: "Email", dataIndex: "email", width: 220, minWidth: 120 },
    { key: "department", title: "Dept", dataIndex: "department", width: 130, minWidth: 80 },
    { key: "salary", title: "Salary", dataIndex: "salary", width: 120, minWidth: 70, align: "right", render: (v: number) => `$${v.toLocaleString()}` },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={EMPLOYEES.slice(0, 5)}
      rowKey="id"
      columnResize={{ mode: "fixed" }}
    />
  );
}

function ColumnResizeFluidDemo() {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", flex: 2, minWidth: 120 },
    { key: "age", title: "Age", dataIndex: "age", flex: 0.5, minWidth: 50, align: "right" },
    { key: "email", title: "Email", dataIndex: "email", flex: 2, minWidth: 150 },
    { key: "department", title: "Dept", dataIndex: "department", flex: 1, minWidth: 80 },
    { key: "salary", title: "Salary", dataIndex: "salary", flex: 1, minWidth: 70, align: "right", render: (v: number) => `$${v.toLocaleString()}` },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={EMPLOYEES.slice(0, 5)}
      rowKey="id"
      columnResize={{ mode: "overflow" }}
    />
  );
}

const STICKY_DATA: Employee[] = [
  ...EMPLOYEES,
  { id: 8, name: "Hank Pym", age: 48, email: "hank@example.com", department: "Engineering", salary: 102000 },
  { id: 9, name: "Iris West", age: 31, email: "iris@example.com", department: "Marketing", salary: 79000 },
  { id: 10, name: "Jake Peralta", age: 35, email: "jake@example.com", department: "Design", salary: 85000 },
  { id: 11, name: "Kara Danvers", age: 27, email: "kara@example.com", department: "Engineering", salary: 93000 },
  { id: 12, name: "Leo Fitz", age: 33, email: "leo@example.com", department: "Engineering", salary: 97000 },
  { id: 13, name: "Maya Lopez", age: 39, email: "maya@example.com", department: "Design", salary: 91000 },
  { id: 14, name: "Nate Heywood", age: 44, email: "nate@example.com", department: "Marketing", salary: 87000 },
  { id: 15, name: "Olivia Pope", age: 38, email: "olivia@example.com", department: "Engineering", salary: 115000 },
];

function StickyDemo() {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name (sticky left)", dataIndex: "name", width: 180, fixed: "left" },
    { key: "age", title: "Age", dataIndex: "age", width: 120 },
    { key: "email", title: "Email", dataIndex: "email", width: 280 },
    { key: "department", title: "Dept", dataIndex: "department", width: 200 },
    { key: "salary", title: "Salary", dataIndex: "salary", width: 200, render: (v: number) => `$${v.toLocaleString()}` },
    { key: "id", title: "ID (sticky right)", dataIndex: "id", width: 120, fixed: "right" },
  ];

  return (
    <div style={{ maxWidth: 600 }}>
      <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
        Scroll horizontally &amp; vertically — Name sticks left, ID sticks right, header sticks top
      </p>
      <DataTable<Employee>
        columns={columns}
        dataSource={STICKY_DATA}
        rowKey="id"
        stickyHeader
        style={{ maxHeight: 250 }}
      />
    </div>
  );
}

function RowDnDDemo() {
  const [data, setData] = useState(EMPLOYEES.slice(0, 5));

  const reorder = useCallback(
    (from: number, to: number) => {
      setData((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    },
    []
  );

  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180 },
    { key: "department", title: "Dept", dataIndex: "department", width: 130 },
    { key: "age", title: "Age", dataIndex: "age", width: 80 },
  ];

  return (
    <>
      <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
        Drag the ⠿ handle to reorder rows
      </p>
      <DataTable<Employee>
        columns={columns}
        dataSource={data}
        rowKey="id"
        rowDragAndDrop={{ onReorder: reorder }}
      />
    </>
  );
}

function ColumnDnDDemo() {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180 },
    { key: "age", title: "Age", dataIndex: "age", width: 80 },
    { key: "email", title: "Email", dataIndex: "email", width: 220 },
    { key: "department", title: "Dept", dataIndex: "department", width: 130 },
  ];

  return (
    <>
      <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
        Drag column headers to reorder columns
      </p>
      <DataTable<Employee>
        columns={columns}
        dataSource={EMPLOYEES.slice(0, 4)}
        rowKey="id"
        columnDragAndDrop={{ onReorder: (from, to) => console.log("col move", from, to) }}
      />
    </>
  );
}

function KeyboardNavDemo() {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180 },
    { key: "age", title: "Age", dataIndex: "age", width: 80 },
    { key: "department", title: "Dept", dataIndex: "department", width: 130 },
  ];

  return (
    <>
      <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
        Click a cell, then use arrow keys to navigate
      </p>
      <DataTable<Employee>
        columns={columns}
        dataSource={EMPLOYEES.slice(0, 4)}
        rowKey="id"
        keyboardNavigation
      />
    </>
  );
}

function CombinedDemo() {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [sortState, setSortState] = useState<SortState | null>(null);

  const sorted = [...EMPLOYEES].sort((a, b) => {
    if (!sortState) return 0;
    const { columnKey, direction } = sortState;
    const av = a[columnKey as keyof Employee];
    const bv = b[columnKey as keyof Employee];
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return direction === "asc" ? cmp : -cmp;
  });

  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180, sortable: true, resizable: true },
    { key: "age", title: "Age", dataIndex: "age", width: 80, sortable: true, align: "right" },
    { key: "email", title: "Email", dataIndex: "email", width: 220, resizable: true },
    { key: "department", title: "Dept", dataIndex: "department", width: 130, sortable: true },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      sortable: true,
      align: "right",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
  ];

  return (
    <>
      <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
        Selection + sorting + resize + expandable + keyboard nav
      </p>
      <DataTable<Employee>
        columns={columns}
        dataSource={sorted}
        rowKey="id"
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: (keys) => setSelectedKeys(keys),
        }}
        expandable={{
          expandedRowRender: (r) => (
            <div style={{ padding: 12 }}>Detail for {r.name}: {r.email}</div>
          ),
        }}
        sortState={sortState}
        onSort={setSortState}
        columnResize={{ minWidth: 60 }}
        stickyHeader
        keyboardNavigation
        style={tableStyle}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Playground Page
   ═══════════════════════════════════════════════════════════════ */

type CellOverflow = "default" | "wrap" | "truncate";

const overflowClass: Record<CellOverflow, string | undefined> = {
  default: undefined,
  wrap: dataTableStyles.wrapCells,
  truncate: dataTableStyles.truncateCells,
};

export default function DataTablePlayground() {
  const [cellOverflow, setCellOverflow] = useState<CellOverflow>("default");

  return (
    <div>
      <h1>DataTable</h1>
      <p style={{ opacity: 0.6, marginBottom: 16 }}>
        Functional demos — no decorative styling applied.
      </p>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 32 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Cell overflow:</span>
        {(["default", "wrap", "truncate"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setCellOverflow(mode)}
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: cellOverflow === mode ? "#333" : "#fff",
              color: cellOverflow === mode ? "#fff" : "#333",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className={overflowClass[cellOverflow]}>
      <section style={sectionStyle}>
        <h2>Cell States (Checked / Error / Disabled / Hover / Focus)</h2>
        <div style={cardStyle}><CellStatesDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Basic</h2>
        <div style={cardStyle}><BasicDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>RowSpan</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Department column merges vertically for consecutive rows in the same department via <code>onCell</code> returning <code>rowSpan</code>.
        </p>
        <div style={cardStyle}><RowSpanDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>ColSpan</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Section header rows span all columns using <code>colSpan</code>. Other columns return <code>colSpan: 0</code> to hide.
        </p>
        <div style={cardStyle}><ColSpanDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Grouped Headers (Multi-Level)</h2>
        <div style={cardStyle}><GroupedHeaderDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Row Selection</h2>
        <div style={cardStyle}><SelectionDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Expandable Rows</h2>
        <div style={cardStyle}><ExpandableDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Tree / Hierarchical Data</h2>
        <div style={cardStyle}><TreeDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Sorting</h2>
        <div style={cardStyle}><SortingDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Column Resize</h2>
        <h3>Fixed table width (default)</h3>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Table width stays constant. Dragging a column border grows/shrinks it and the neighbor column compensates — no overflow.
        </p>
        <div style={cardStyle}><ColumnResizeDefaultDemo /></div>

        <h3 style={{ marginTop: 24 }}>Overflow (flex widths)</h3>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Columns use <code>flex</code> to share available space. Resizing a column converts it to a fixed width; the table can overflow.
        </p>
        <div style={cardStyle}><ColumnResizeFluidDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Sticky Header & Columns</h2>
        <div style={cardStyle}><StickyDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Row Drag & Drop Reordering</h2>
        <div style={cardStyle}><RowDnDDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Column Drag & Drop Reordering</h2>
        <div style={cardStyle}><ColumnDnDDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Keyboard Navigation</h2>
        <div style={cardStyle}><KeyboardNavDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Combined Features</h2>
        <div style={cardStyle}><CombinedDemo /></div>
      </section>
      </div>
    </div>
  );
}
