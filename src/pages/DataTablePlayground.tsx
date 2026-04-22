import { useState, useCallback, useMemo, type CSSProperties } from "react";
import { DataTable, type ColumnDef, type SortState, type TableDensity } from "../components/DataTable";
import { DataCellContent } from "../components/DataCellContent";
import { RowContainer } from "../components/RowContainer";
import { Badge } from "../components/Badge";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { TreeIndent, type TreeIndentLineStyle } from "../components/TreeIndent";
import { computeConnectorGuides } from "../utils/treeConnectors";

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
          {
            id: 111,
            name: "Alice",
            role: "Lead",
            children: [
              { id: 1111, name: "Alice Jr.", role: "Intern" },
              { id: 1112, name: "Alex", role: "Intern" },
            ],
          },
          { id: 112, name: "Bob", role: "Developer" },
          { id: 113, name: "Carol", role: "Developer" },
        ],
      },
      {
        id: 12,
        name: "Backend",
        role: "Team",
        children: [
          { id: 121, name: "Charlie", role: "Lead" },
          { id: 122, name: "Diana", role: "Developer" },
          {
            id: 123,
            name: "Platform",
            role: "Sub-team",
            children: [
              { id: 1231, name: "Eli", role: "SRE" },
              {
                id: 1232,
                name: "Faye",
                role: "SRE",
                children: [
                  { id: 12321, name: "Nora", role: "Junior SRE" },
                  { id: 12322, name: "Oscar", role: "Junior SRE" },
                ],
              },
              { id: 1233, name: "Greg", role: "SRE" },
            ],
          },
        ],
      },
      {
        id: 13,
        name: "QA",
        role: "Team",
        children: [
          { id: 131, name: "Heidi", role: "Lead" },
          { id: 132, name: "Ivan", role: "Tester" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Design",
    role: "Department",
    children: [
      {
        id: 21,
        name: "Product Design",
        role: "Team",
        children: [
          { id: 211, name: "Eve", role: "Lead" },
          { id: 212, name: "Frank", role: "Designer" },
        ],
      },
      { id: 22, name: "Brand", role: "Team" },
    ],
  },
  {
    id: 3,
    name: "Marketing",
    role: "Department",
    children: [
      { id: 31, name: "Grace", role: "Lead" },
      { id: 32, name: "Hank", role: "Analyst" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   Sub-demos (stateful sections)
   ═══════════════════════════════════════════════════════════════ */

function CellStatesDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([2, 5]);

  const columns: ColumnDef<Employee>[] = [
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      width: 200,
      render: (_, r) => <DataCellContent title={r.name} description={r.email} />,
    },
    { key: "age", title: "Age", dataIndex: "age", width: 80, align: "right",
      render: (v: number) => <DataCellContent title={String(v)} textAlignment="right" />,
    },
    { key: "department", title: "Dept", dataIndex: "department", width: 130,
      render: (v: string) => <DataCellContent title={v} />,
    },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      align: "right",
      render: (v: number) => (
        <DataCellContent title={`$${v.toLocaleString()}`} textAlignment="right" />
      ),
    },
  ];

  const disabledColumns: ColumnDef<Employee>[] = columns.map((col) => ({
    ...col,
    render: col.render
      ? (v: any, r: Employee, i: number) => {
          const el = (col.render as any)(v, r, i);
          if (el && typeof el === "object" && el.props) {
            const isDisabled = r.department === "Marketing";
            return { ...el, props: { ...el.props, state: isDisabled ? "disable" : "normal" } };
          }
          return el;
        }
      : col.render,
  }));

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
          density={density} columnDividers={columnDividers} rowDividers={rowDividers}
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
          density={density} columnDividers={columnDividers} rowDividers={rowDividers}
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
          columns={disabledColumns}
          dataSource={EMPLOYEES}
          rowKey="id"
          density={density} columnDividers={columnDividers} rowDividers={rowDividers}
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
          density={density} columnDividers={columnDividers} rowDividers={rowDividers}
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

function BasicDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const columns: ColumnDef<Employee>[] = [
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      width: 220,
      render: (_, r) => (
        <DataCellContent
          title={r.name}
          description={r.email}
          leading={
            <RowContainer density="sm">
              <Icon name="person" size={20} />
            </RowContainer>
          }
        />
      ),
    },
    {
      key: "age",
      title: "Age",
      dataIndex: "age",
      width: 80,
      align: "right",
      render: (v: number) => (
        <DataCellContent title={String(v)} textAlignment="right" />
      ),
    },
    {
      key: "department",
      title: "Dept",
      dataIndex: "department",
      width: 150,
      render: (v: string) => (
        <DataCellContent
          title={v}
          trailing={
            <RowContainer density="sm">
              <Badge size="sm">{v}</Badge>
            </RowContainer>
          }
        />
      ),
    },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 140,
      align: "right",
      render: (v: number) => (
        <DataCellContent
          title={`$${v.toLocaleString()}`}
          description="Annual"
          textAlignment="right"
        />
      ),
    },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={EMPLOYEES}
      rowKey="id"
      density={density} columnDividers={columnDividers} rowDividers={rowDividers}
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

function RowSpanDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const columns: ColumnDef<Employee>[] = [
    {
      key: "department",
      title: "Department",
      dataIndex: "department",
      width: 130,
      onCell: (_record, index) => ({ rowSpan: deptSpans.get(index) }),
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "name", title: "Name", dataIndex: "name", width: 160,
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "age", title: "Age", dataIndex: "age", width: 80, align: "right",
      render: (v: number) => <DataCellContent title={String(v)} textAlignment="right" />,
    },
    { key: "email", title: "Email", dataIndex: "email", width: 220,
      render: (v: string) => <DataCellContent title={v} />,
    },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      align: "right",
      render: (v: number) => (
        <DataCellContent title={`$${v.toLocaleString()}`} textAlignment="right" />
      ),
    },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={ROWSPAN_DATA}
      rowKey="id"
      density={density} columnDividers={columnDividers} rowDividers={rowDividers}
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

function ColSpanDemo({ density, columnDividers, rowDividers }: DemoProps) {
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
      render: (v: string, r) =>
        r.isSectionHeader ? <DataCellContent title={v} /> : <DataCellContent title={v} />,
    },
    {
      key: "age",
      title: "Age",
      dataIndex: "age",
      width: 80,
      align: "right",
      onCell: (record) => (record.isSectionHeader ? { colSpan: 0 } : {}),
      render: (v: number | null) =>
        v != null ? <DataCellContent title={String(v)} textAlignment="right" /> : null,
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      width: 220,
      onCell: (record) => (record.isSectionHeader ? { colSpan: 0 } : {}),
      render: (v: string, r) =>
        r.isSectionHeader ? null : <DataCellContent title={v} />,
    },
    {
      key: "department",
      title: "Dept",
      dataIndex: "department",
      width: 130,
      onCell: (record) => (record.isSectionHeader ? { colSpan: 0 } : {}),
      render: (v: string, r) =>
        r.isSectionHeader ? null : <DataCellContent title={v} />,
    },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      align: "right",
      onCell: (record) => (record.isSectionHeader ? { colSpan: 0 } : {}),
      render: (v: number | null) =>
        v != null ? <DataCellContent title={`$${v.toLocaleString()}`} textAlignment="right" /> : null,
    },
  ];

  return (
    <DataTable<ColSpanRow>
      columns={columns}
      dataSource={COLSPAN_DATA}
      rowKey="id"
      density={density} columnDividers={columnDividers} rowDividers={rowDividers}
    />
  );
}

function GroupedHeaderDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180,
      render: (v: string) => <DataCellContent title={v} />,
    },
    {
      key: "personal",
      title: "Personal Info",
      children: [
        { key: "age", title: "Age", dataIndex: "age", width: 80, align: "right",
          render: (v: number) => <DataCellContent title={String(v)} textAlignment="right" />,
        },
        { key: "email", title: "Email", dataIndex: "email", width: 220,
          render: (v: string) => <DataCellContent title={v} />,
        },
      ],
    },
    {
      key: "work",
      title: "Work Info",
      children: [
        { key: "department", title: "Dept", dataIndex: "department", width: 130,
          render: (v: string) => <DataCellContent title={v} />,
        },
        {
          key: "salary",
          title: "Salary",
          dataIndex: "salary",
          width: 120,
          align: "right",
          render: (v: number) => (
            <DataCellContent title={`$${v.toLocaleString()}`} textAlignment="right" />
          ),
        },
      ],
    },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={EMPLOYEES}
      rowKey="id"
      density={density} columnDividers={columnDividers} rowDividers={rowDividers}
    />
  );
}

function SelectionDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [radioKey, setRadioKey] = useState<React.Key[]>([]);

  const isDisabled = (r: Employee) => r.id === 3;

  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180,
      render: (_: string, r: Employee) => <DataCellContent title={r.name} state={isDisabled(r) ? "disable" : "normal"} />,
    },
    { key: "age", title: "Age", dataIndex: "age", width: 80,
      render: (v: number, r: Employee) => <DataCellContent title={String(v)} state={isDisabled(r) ? "disable" : "normal"} />,
    },
    { key: "department", title: "Dept", dataIndex: "department", width: 130,
      render: (v: string, r: Employee) => <DataCellContent title={v} state={isDisabled(r) ? "disable" : "normal"} />,
    },
  ];

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 300 }}>
        <h4 style={{ margin: "0 0 8px" }}>Checkbox (multi-select)</h4>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Selected: {selectedKeys.length ? selectedKeys.join(", ") : "none"} — Row 3 is disabled
        </p>
        <DataTable<Employee>
          columns={columns}
          dataSource={EMPLOYEES.slice(0, 5)}
          rowKey="id"
          density={density} columnDividers={columnDividers} rowDividers={rowDividers}
          rowDisabled={isDisabled}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedKeys,
            onChange: (keys) => setSelectedKeys(keys),
            getCheckboxProps: (r) => ({ disabled: isDisabled(r) }),
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 300 }}>
        <h4 style={{ margin: "0 0 8px" }}>Radio (single-select)</h4>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Selected: {radioKey.length ? radioKey[0] : "none"} — Row 3 is disabled
        </p>
        <DataTable<Employee>
          columns={columns}
          dataSource={EMPLOYEES.slice(0, 5)}
          rowKey="id"
          density={density} columnDividers={columnDividers} rowDividers={rowDividers}
          rowDisabled={isDisabled}
          rowSelection={{
            type: "radio",
            selectedRowKeys: radioKey,
            onChange: (keys) => setRadioKey(keys),
            getCheckboxProps: (r) => ({ disabled: isDisabled(r) }),
          }}
        />
      </div>
    </div>
  );
}

function ExpandableDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180,
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "department", title: "Dept", dataIndex: "department", width: 130,
      render: (v: string) => <DataCellContent title={v} />,
    },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      render: (v: number) => (
        <DataCellContent title={`$${v.toLocaleString()}`} />
      ),
    },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={EMPLOYEES.slice(0, 5)}
      rowKey="id"
      density={density} columnDividers={columnDividers} rowDividers={rowDividers}
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

function TreeDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const [showConnectors, setShowConnectors] = useState(true);
  const [indentWidth, setIndentWidth] = useState(32);
  const [lineStyle, setLineStyle] = useState<TreeIndentLineStyle>("slope");

  const columns: ColumnDef<TreeRow>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 250,
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "role", title: "Role", dataIndex: "role", width: 150,
      render: (v: string) => <DataCellContent title={v} state="normal-low" />,
    },
  ];

  return (
    <>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={showConnectors} onChange={(e) => setShowConnectors(e.target.checked)} />
          Show connector lines
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          Style:
          <select
            value={lineStyle}
            onChange={(e) => setLineStyle(e.target.value as TreeIndentLineStyle)}
            style={{ padding: "2px 6px", borderRadius: 4, fontSize: 13 }}
          >
            <option value="slope">Slope</option>
            <option value="square">Square (L-shape)</option>
          </select>
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          Indent width:
          <input
            type="range"
            min={12}
            max={48}
            value={indentWidth}
            onChange={(e) => setIndentWidth(Number(e.target.value))}
            style={{ width: 100 }}
          />
          <span style={{ minWidth: 30 }}>{indentWidth}px</span>
        </label>
      </div>
      <DataTable<TreeRow>
        columns={columns}
        dataSource={TREE_DATA}
        rowKey="id"
        density={density} columnDividers={columnDividers} rowDividers={rowDividers}
        expandable={{ defaultExpandedRowKeys: [1, 2, 3, 11, 12, 13, 21, 111, 123, 1232] }}
        treeConnectorLines={showConnectors}
        treeIndentWidth={indentWidth}
        treeLineStyle={lineStyle}
      />
    </>
  );
}

function SortingDemo({ density, columnDividers, rowDividers }: DemoProps) {
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
    { key: "name", title: "Name", dataIndex: "name", width: 180, sortable: true,
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "age", title: "Age", dataIndex: "age", width: 80, sortable: true, align: "right",
      render: (v: number) => <DataCellContent title={String(v)} textAlignment="right" />,
    },
    { key: "department", title: "Dept", dataIndex: "department", width: 130, sortable: true,
      render: (v: string) => <DataCellContent title={v} />,
    },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      sortable: true,
      align: "right",
      render: (v: number) => (
        <DataCellContent title={`$${v.toLocaleString()}`} textAlignment="right" />
      ),
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
        density={density} columnDividers={columnDividers} rowDividers={rowDividers}
        sortState={sortState}
        onSort={setSortState}
      />
    </>
  );
}

function ColumnResizeDefaultDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180, minWidth: 80,
      render: (v: string, r: Employee) => <DataCellContent title={v} description={r.email} />,
    },
    { key: "age", title: "Age", dataIndex: "age", width: 80, minWidth: 50,
      render: (v: number) => <DataCellContent title={String(v)} />,
    },
    { key: "email", title: "Email", dataIndex: "email", width: 220, minWidth: 120,
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "department", title: "Dept", dataIndex: "department", width: 130, minWidth: 80,
      render: (v: string) => <DataCellContent title={v} description="Team member" />,
    },
    { key: "salary", title: "Salary", dataIndex: "salary", width: 120, minWidth: 70, align: "right",
      render: (v: number) => <DataCellContent title={`$${v.toLocaleString()}`} textAlignment="right" />,
    },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={EMPLOYEES}
      rowKey="id"
      density={density} columnDividers={columnDividers} rowDividers={rowDividers}
      columnResize={{ mode: "fixed" }}
      stickyHeader
      style={{ maxHeight: 320 }}
    />
  );
}

function ColumnResizeFluidDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", flex: 2, minWidth: 120,
      render: (v: string, r: Employee) => <DataCellContent title={v} description={r.email} />,
    },
    { key: "age", title: "Age", dataIndex: "age", flex: 0.5, minWidth: 50, align: "right",
      render: (v: number) => <DataCellContent title={String(v)} textAlignment="right" />,
    },
    { key: "email", title: "Email", dataIndex: "email", flex: 2, minWidth: 150,
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "department", title: "Dept", dataIndex: "department", flex: 1, minWidth: 80,
      render: (v: string) => <DataCellContent title={v} description="Team member" />,
    },
    { key: "salary", title: "Salary", dataIndex: "salary", flex: 1, minWidth: 70, align: "right",
      render: (v: number) => <DataCellContent title={`$${v.toLocaleString()}`} textAlignment="right" />,
    },
  ];

  return (
    <DataTable<Employee>
      columns={columns}
      dataSource={EMPLOYEES}
      rowKey="id"
      density={density} columnDividers={columnDividers} rowDividers={rowDividers}
      columnResize={{ mode: "overflow" }}
      stickyHeader
      style={{ maxHeight: 320 }}
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

function StickyDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const fmt = (v: number) => `$${v.toLocaleString()}`;
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name (sticky left)", dataIndex: "name", width: 180, fixed: "left",
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "age", title: "Age", dataIndex: "age", width: 100, align: "right",
      render: (v: number) => <DataCellContent title={String(v)} textAlignment="right" />,
    },
    { key: "email", title: "Email (sticky left)", dataIndex: "email", width: 260, fixed: "left",
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "department", title: "Dept", dataIndex: "department", width: 160,
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "salary", title: "Salary", dataIndex: "salary", width: 140, align: "right",
      render: (v: number) => <DataCellContent title={fmt(v)} textAlignment="right" />,
    },
    { key: "bonus", title: "Bonus (sticky left)", dataIndex: "salary", width: 140, fixed: "left", align: "right",
      render: (v: number) => <DataCellContent title={fmt(Math.round(v * 0.15))} textAlignment="right" />,
    },
    { key: "total", title: "Total Comp", dataIndex: "salary", width: 150, align: "right",
      render: (v: number) => <DataCellContent title={fmt(Math.round(v * 1.15))} textAlignment="right" />,
    },
    { key: "startYear", title: "Start Year", dataIndex: "id", width: 120,
      render: (v: number) => <DataCellContent title={String(2018 + (v % 7))} />,
    },
    { key: "level", title: "Level", dataIndex: "age", width: 100,
      render: (v: number) => <DataCellContent title={v < 30 ? "Junior" : v < 40 ? "Mid" : "Senior"} />,
    },
    { key: "location", title: "Location", dataIndex: "department", width: 160,
      render: (v: string) => <DataCellContent title={v === "Engineering" ? "San Francisco" : v === "Design" ? "New York" : v === "Marketing" ? "London" : "Berlin"} />,
    },
    { key: "id", title: "ID (sticky right)", dataIndex: "id", width: 100, fixed: "right", align: "right",
      render: (v: number) => <DataCellContent title={String(v)} textAlignment="right" />,
    },
  ];

  return (
    <div>
      <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
        Scroll horizontally &amp; vertically — Name sticks left, ID sticks right, header sticks top
      </p>
      <DataTable<Employee>
        columns={columns}
        dataSource={STICKY_DATA}
        rowKey="id"
        density={density} columnDividers={columnDividers} rowDividers={rowDividers}
        stickyHeader
        style={{ maxHeight: 250 }}
      />
    </div>
  );
}

function RowDnDDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const [data, setData] = useState(STICKY_DATA);

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
    { key: "name", title: "Name", dataIndex: "name", width: 220,
      render: (_: string, r: Employee) => <DataCellContent title={r.name} description={r.email} />,
    },
    { key: "department", title: "Dept", dataIndex: "department", width: 150,
      render: (v: string, r: Employee) => <DataCellContent title={v} description={`ID: ${r.id}`} />,
    },
    { key: "age", title: "Age", dataIndex: "age", width: 100,
      render: (v: number) => <DataCellContent title={String(v)} description="years" />,
    },
    { key: "salary", title: "Salary", dataIndex: "salary", width: 140, align: "right",
      render: (v: number) => <DataCellContent title={`$${v.toLocaleString()}`} description="Annual" textAlignment="right" />,
    },
  ];

  return (
    <>
      <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
        Drag the ⠿ handle to reorder rows — scroll vertically with sticky header
      </p>
      <DataTable<Employee>
        columns={columns}
        dataSource={data}
        rowKey="id"
        density={density} columnDividers={columnDividers} rowDividers={rowDividers}
        stickyHeader
        rowDragAndDrop={{ onReorder: reorder }}
        style={{ maxHeight: 300 }}
      />
    </>
  );
}

function ColumnDnDDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180,
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "age", title: "Age", dataIndex: "age", width: 80,
      render: (v: number) => <DataCellContent title={String(v)} />,
    },
    { key: "email", title: "Email", dataIndex: "email", width: 220,
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "department", title: "Dept", dataIndex: "department", width: 130,
      render: (v: string) => <DataCellContent title={v} />,
    },
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
        density={density} columnDividers={columnDividers} rowDividers={rowDividers}
        columnDragAndDrop={{ onReorder: (from, to) => console.log("col move", from, to) }}
      />
    </>
  );
}

function KeyboardNavDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180,
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "age", title: "Age", dataIndex: "age", width: 80,
      render: (v: number) => <DataCellContent title={String(v)} />,
    },
    { key: "department", title: "Dept", dataIndex: "department", width: 130,
      render: (v: string) => <DataCellContent title={v} />,
    },
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
        density={density} columnDividers={columnDividers} rowDividers={rowDividers}
        keyboardNavigation
      />
    </>
  );
}

function CombinedDemo({ density, columnDividers, rowDividers }: DemoProps) {
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
    { key: "name", title: "Name", dataIndex: "name", width: 180, sortable: true, resizable: true,
      render: (_, r) => (
        <DataCellContent
          title={r.name}
          description={r.department}
          leading={
            <RowContainer density="sm">
              <Icon name="person" size={20} />
            </RowContainer>
          }
          trailing={
            <RowContainer density="sm">
              <IconButton icon={<Icon name="more_vert" size={16} />} size="sm" emphasis="low" variant="neutral" aria-label="More options" />
            </RowContainer>
          }
        />
      ),
    },
    { key: "age", title: "Age", dataIndex: "age", width: 80, sortable: true, align: "right",
      render: (v: number) => <DataCellContent title={String(v)} textAlignment="right" />,
    },
    { key: "email", title: "Email", dataIndex: "email", width: 220, resizable: true,
      render: (v: string) => <DataCellContent title={v} />,
    },
    { key: "department", title: "Dept", dataIndex: "department", width: 130, sortable: true,
      render: (v: string) => <DataCellContent title={v} />,
    },
    {
      key: "salary",
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      sortable: true,
      align: "right",
      render: (v: number) => (
        <DataCellContent title={`$${v.toLocaleString()}`} textAlignment="right" />
      ),
    },
  ];

  return (
    <>
      <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
        Selection + sorting + resize + expandable + keyboard nav + DataCellContent
      </p>
      <DataTable<Employee>
        columns={columns}
        dataSource={sorted}
        rowKey="id"
        density={density} columnDividers={columnDividers} rowDividers={rowDividers}
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

/* ── Deep header groups demo ── */

interface CompRow {
  id: number;
  name: string;
  title: string;
  department: string;
  baseSalary: number;
  bonus: number;
  rsus: number;
  options: number;
}

const COMP_DATA: CompRow[] = [
  { id: 1, name: "Alice Johnson", title: "Staff Engineer", department: "Engineering", baseSalary: 185000, bonus: 28000, rsus: 60000, options: 12000 },
  { id: 2, name: "Bob Smith", title: "Director", department: "Marketing", baseSalary: 165000, bonus: 33000, rsus: 45000, options: 8000 },
  { id: 3, name: "Charlie Brown", title: "Senior Engineer", department: "Engineering", baseSalary: 155000, bonus: 18000, rsus: 40000, options: 10000 },
  { id: 4, name: "Diana Prince", title: "Lead Designer", department: "Design", baseSalary: 145000, bonus: 15000, rsus: 30000, options: 5000 },
  { id: 5, name: "Eve Martinez", title: "Engineer", department: "Engineering", baseSalary: 130000, bonus: 12000, rsus: 25000, options: 6000 },
  { id: 6, name: "Frank Lee", title: "VP Marketing", department: "Marketing", baseSalary: 210000, bonus: 50000, rsus: 80000, options: 20000 },
];

function DeepHeaderGroupDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const fmt = (v: number) => `$${v.toLocaleString()}`;

  const columns: ColumnDef<CompRow>[] = [
    {
      key: "employee",
      title: "Employee",
      children: [
        { key: "name", title: "Name", dataIndex: "name", width: 170, minWidth: 100,
          render: (v: string, r) => <DataCellContent title={v} description={r.title} />,
        },
        { key: "department", title: "Dept", dataIndex: "department", width: 130, minWidth: 80,
          render: (v: string) => <DataCellContent title={v} />,
        },
      ],
    },
    {
      key: "compensation",
      title: "Compensation",
      children: [
        {
          key: "base",
          title: "Base",
          children: [
            { key: "baseSalary", title: "Salary", dataIndex: "baseSalary", width: 120, minWidth: 80, align: "right",
              render: (v: number) => <DataCellContent title={fmt(v)} textAlignment="right" />,
            },
            { key: "bonus", title: "Bonus", dataIndex: "bonus", width: 110, minWidth: 70, align: "right",
              render: (v: number) => <DataCellContent title={fmt(v)} textAlignment="right" />,
            },
          ],
        },
        {
          key: "equity",
          title: "Equity",
          children: [
            { key: "rsus", title: "RSUs", dataIndex: "rsus", width: 110, minWidth: 70, align: "right",
              render: (v: number) => <DataCellContent title={fmt(v)} textAlignment="right" />,
            },
            { key: "options", title: "Options", dataIndex: "options", width: 110, minWidth: 70, align: "right",
              render: (v: number) => <DataCellContent title={fmt(v)} textAlignment="right" />,
            },
          ],
        },
      ],
    },
  ];

  return (
    <DataTable<CompRow>
      columns={columns}
      dataSource={COMP_DATA}
      rowKey="id"
      density={density} columnDividers={columnDividers} rowDividers={rowDividers}
      columnResize={{ mode: "fixed" }}
    />
  );
}

/* ── Grouped Header Column DnD demo ── */

interface ProjectRow {
  id: number;
  project: string;
  lead: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  priority: string;
  status: string;
}

const PROJECT_DATA: ProjectRow[] = [
  { id: 1, project: "Website Redesign", lead: "Alice", startDate: "2025-01-15", endDate: "2025-06-30", budget: 120000, spent: 87000, priority: "High", status: "In Progress" },
  { id: 2, project: "Mobile App v2", lead: "Bob", startDate: "2025-03-01", endDate: "2025-09-15", budget: 200000, spent: 45000, priority: "Critical", status: "In Progress" },
  { id: 3, project: "Data Pipeline", lead: "Charlie", startDate: "2025-02-10", endDate: "2025-05-20", budget: 85000, spent: 82000, priority: "Medium", status: "Review" },
  { id: 4, project: "Auth Service", lead: "Diana", startDate: "2025-04-01", endDate: "2025-07-31", budget: 60000, spent: 12000, priority: "High", status: "Planning" },
  { id: 5, project: "Analytics Dashboard", lead: "Eve", startDate: "2025-01-20", endDate: "2025-04-30", budget: 95000, spent: 91000, priority: "Low", status: "Complete" },
];

const DIVIDER_COLS: ColumnDef<Employee>[] = [
  { key: "name", title: "Name", dataIndex: "name", width: 180, render: (v: string) => <DataCellContent title={v} /> },
  { key: "department", title: "Department", dataIndex: "department", width: 140, render: (v: string) => <DataCellContent title={v} /> },
  { key: "age", title: "Age", dataIndex: "age", width: 80, render: (v: number) => <DataCellContent title={String(v)} /> },
  { key: "salary", title: "Salary", dataIndex: "salary", width: 120, render: (v: number) => <DataCellContent title={`$${v.toLocaleString()}`} /> },
];

function NoColumnDividersDemo({ density }: { density: TableDensity }) {
  return (
    <DataTable columns={DIVIDER_COLS} dataSource={EMPLOYEES} rowKey="id" density={density} columnDividers={false} />
  );
}

function NoRowDividersDemo({ density }: { density: TableDensity }) {
  return (
    <DataTable columns={DIVIDER_COLS} dataSource={EMPLOYEES} rowKey="id" density={density} rowDividers={false} />
  );
}

function NoDividersDemo({ density }: { density: TableDensity }) {
  return (
    <DataTable columns={DIVIDER_COLS} dataSource={EMPLOYEES} rowKey="id" density={density} columnDividers={false} rowDividers={false} />
  );
}

function CellOverrideDividersDemo({ density }: { density: TableDensity }) {
  // Table has no column dividers, but "Name" column explicitly shows its right divider
  // Table has row dividers, but "Age" column hides its bottom divider
  const columns: ColumnDef<Employee>[] = [
    { key: "name", title: "Name", dataIndex: "name", width: 180, dividerRight: true, render: (v: string) => <DataCellContent title={v} /> },
    { key: "department", title: "Department", dataIndex: "department", width: 140, render: (v: string) => <DataCellContent title={v} /> },
    { key: "age", title: "Age", dataIndex: "age", width: 80, dividerBottom: false, render: (v: number) => <DataCellContent title={String(v)} /> },
    { key: "salary", title: "Salary", dataIndex: "salary", width: 120, render: (v: number) => <DataCellContent title={`$${v.toLocaleString()}`} /> },
  ];

  return (
    <DataTable columns={columns} dataSource={EMPLOYEES} rowKey="id" density={density} columnDividers={false} />
  );
}

function GroupedHeaderColDnDDemo({ density, columnDividers, rowDividers }: DemoProps) {
  const fmt = (v: number) => `$${v.toLocaleString()}`;

  const columns: ColumnDef<ProjectRow>[] = [
    {
      key: "overview",
      title: "Overview",
      children: [
        { key: "project", title: "Project", dataIndex: "project", width: 170,
          render: (v: string) => <DataCellContent title={v} />,
        },
        { key: "lead", title: "Lead", dataIndex: "lead", width: 110,
          render: (v: string) => <DataCellContent title={v} />,
        },
        { key: "status", title: "Status", dataIndex: "status", width: 120,
          render: (v: string) => <DataCellContent title={v} />,
        },
      ],
    },
    {
      key: "schedule",
      title: "Schedule",
      children: [
        { key: "startDate", title: "Start", dataIndex: "startDate", width: 120,
          render: (v: string) => <DataCellContent title={v} />,
        },
        { key: "endDate", title: "End", dataIndex: "endDate", width: 120,
          render: (v: string) => <DataCellContent title={v} />,
        },
        { key: "priority", title: "Priority", dataIndex: "priority", width: 100,
          render: (v: string) => <DataCellContent title={v} />,
        },
      ],
    },
    {
      key: "financials",
      title: "Financials",
      children: [
        { key: "budget", title: "Budget", dataIndex: "budget", width: 120, align: "right",
          render: (v: number) => <DataCellContent title={fmt(v)} textAlignment="right" />,
        },
        { key: "spent", title: "Spent", dataIndex: "spent", width: 120, align: "right",
          render: (v: number) => <DataCellContent title={fmt(v)} textAlignment="right" />,
        },
      ],
    },
  ];

  return (
    <>
      <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
        Drag sub-column headers to reorder them <strong>within their parent group</strong> — columns cannot cross group
        boundaries. You can also drag <strong>parent group headers</strong> (Overview, Schedule, Financials) to reorder
        entire groups. All descendant columns move with the group.
      </p>
      <DataTable<ProjectRow>
        columns={columns}
        dataSource={PROJECT_DATA}
        rowKey="id"
        density={density} columnDividers={columnDividers} rowDividers={rowDividers}
        columnDragAndDrop={{ onReorder: (from, to) => console.log("grouped col move", from, to) }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Standalone TreeIndent Demo
   ═══════════════════════════════════════════════════════════════ */

interface FileNode {
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
}

const FILE_TREE: FileNode[] = [
  {
    name: "src", type: "folder", children: [
      {
        name: "components", type: "folder", children: [
          { name: "Button.tsx", type: "file" },
          { name: "Input.tsx", type: "file" },
          { name: "Modal.tsx", type: "file" },
        ],
      },
      {
        name: "hooks", type: "folder", children: [
          { name: "useAuth.ts", type: "file" },
          { name: "useFetch.ts", type: "file" },
        ],
      },
      { name: "App.tsx", type: "file" },
      { name: "index.ts", type: "file" },
    ],
  },
  {
    name: "public", type: "folder", children: [
      { name: "favicon.ico", type: "file" },
    ],
  },
  { name: "package.json", type: "file" },
  { name: "README.md", type: "file" },
];

interface FlatFile { name: string; type: "folder" | "file"; depth: number; isLastChild: boolean }

function flattenFiles(nodes: FileNode[], depth = 0): FlatFile[] {
  const out: FlatFile[] = [];
  nodes.forEach((n, i) => {
    const isLast = i === nodes.length - 1;
    out.push({ name: n.name, type: n.type, depth, isLastChild: isLast });
    if (n.children) out.push(...flattenFiles(n.children, depth + 1));
  });
  return out;
}

function StandaloneTreeIndentDemo() {
  const flat = useMemo(() => flattenFiles(FILE_TREE), []);
  const guides = useMemo(
    () => computeConnectorGuides(flat.map((f) => ({ depth: f.depth, isLastChild: f.isLastChild }))),
    [flat]
  );

  return (
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
      {/* With connector lines */}
      <div>
        <h4 style={{ margin: "0 0 8px" }}>With connector lines</h4>
        <div style={{ fontFamily: "var(--type-body-md-family, monospace)", fontSize: 13 }}>
          {flat.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "stretch", height: 28 }}>
              <TreeIndent guide={guides[i]} cellWidth={20} />
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name={f.type === "folder" ? "folder" : "description"} size={16} />
                {f.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Without lines (plain indent) */}
      <div>
        <h4 style={{ margin: "0 0 8px" }}>Without lines (plain indent)</h4>
        <div style={{ fontFamily: "var(--type-body-md-family, monospace)", fontSize: 13 }}>
          {flat.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "stretch", height: 28 }}>
              <TreeIndent guide={guides[i]} cellWidth={20} showLines={false} />
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name={f.type === "folder" ? "folder" : "description"} size={16} />
                {f.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Wider cells */}
      <div>
        <h4 style={{ margin: "0 0 8px" }}>Wider indent (cellWidth=32)</h4>
        <div style={{ fontFamily: "var(--type-body-md-family, monospace)", fontSize: 13 }}>
          {flat.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "stretch", height: 28 }}>
              <TreeIndent guide={guides[i]} cellWidth={32} />
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name={f.type === "folder" ? "folder" : "description"} size={16} />
                {f.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Playground Page
   ═══════════════════════════════════════════════════════════════ */

interface DemoProps { density: TableDensity; columnDividers: boolean; rowDividers: boolean; }

const DENSITIES: TableDensity[] = ["none", "sm", "md", "lg"];
const selectStyle: CSSProperties = {
  padding: "4px 8px",
  borderRadius: 6,
  border: "1px solid var(--element-outline-neutral-default)",
  background: "var(--element-surface-over)",
  color: "var(--text-neutral-primary)",
  fontSize: 13,
};

export default function DataTablePlayground() {
  const [density, setDensity] = useState<TableDensity>("md");
  const [columnDividers, setColumnDividers] = useState(true);
  const [rowDividers, setRowDividers] = useState(true);

  return (
    <div>
      <h1>DataTable</h1>
      <p style={{ opacity: 0.6, marginBottom: 16 }}>
        Functional demos — no decorative styling applied.
      </p>

      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 32 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          Density:{" "}
          <select
            value={density}
            onChange={(e) => setDensity(e.target.value as TableDensity)}
            style={selectStyle}
          >
            {DENSITIES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={columnDividers} onChange={(e) => setColumnDividers(e.target.checked)} />
          Column dividers
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={rowDividers} onChange={(e) => setRowDividers(e.target.checked)} />
          Row dividers
        </label>
      </div>

      <div>
      <section style={sectionStyle}>
        <h2>Cell States (Checked / Error / Disabled / Hover / Focus)</h2>
        <div style={cardStyle}><CellStatesDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Basic</h2>
        <div style={cardStyle}><BasicDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>RowSpan</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Department column merges vertically for consecutive rows in the same department via <code>onCell</code> returning <code>rowSpan</code>.
        </p>
        <div style={cardStyle}><RowSpanDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>ColSpan</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Section header rows span all columns using <code>colSpan</code>. Other columns return <code>colSpan: 0</code> to hide.
        </p>
        <div style={cardStyle}><ColSpanDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Grouped Headers (Multi-Level)</h2>
        <div style={cardStyle}><GroupedHeaderDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Row Selection</h2>
        <div style={cardStyle}><SelectionDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Expandable Rows</h2>
        <div style={cardStyle}><ExpandableDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Tree / Hierarchical Data</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Tree rows with connector lines showing parent–child relationships. Uses the reusable <code>TreeIndent</code> component.
        </p>
        <div style={cardStyle}><TreeDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>TreeIndent (Standalone)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          The <code>TreeIndent</code> component is reusable outside of DataTable.
          File explorer example showing connector lines, plain indent, and custom cell width.
        </p>
        <div style={cardStyle}><StandaloneTreeIndentDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Sorting</h2>
        <div style={cardStyle}><SortingDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Column Resize</h2>
        <h3>Fixed table width (default)</h3>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Table width stays constant. Dragging a column border grows/shrinks it and the neighbor column compensates — no overflow.
        </p>
        <div style={cardStyle}><ColumnResizeDefaultDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>

        <h3 style={{ marginTop: 24 }}>Overflow (flex widths)</h3>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Columns use <code>flex</code> to share available space. Resizing a column converts it to a fixed width; the table can overflow.
        </p>
        <div style={cardStyle}><ColumnResizeFluidDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Sticky Header & Columns</h2>
        <div style={cardStyle}><StickyDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Row Drag & Drop Reordering</h2>
        <div style={cardStyle}><RowDnDDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Column Drag & Drop Reordering</h2>
        <div style={cardStyle}><ColumnDnDDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Keyboard Navigation</h2>
        <div style={cardStyle}><KeyboardNavDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Combined Features</h2>
        <div style={cardStyle}><CombinedDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Header Groups (Deep Nesting)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Three-level header groups: top-level "Employee" and "Compensation" groups,
          with "Compensation" further split into "Base" and "Equity" sub-groups.
        </p>
        <div style={cardStyle}><DeepHeaderGroupDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Grouped Header Column Drag &amp; Drop</h2>
        <div style={cardStyle}><GroupedHeaderColDnDDemo density={density} columnDividers={columnDividers} rowDividers={rowDividers} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>No Column Dividers</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          <code>columnDividers=&#123;false&#125;</code> — hides the right border between all columns table-wide.
        </p>
        <div style={cardStyle}><NoColumnDividersDemo density={density} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>No Row Dividers</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          <code>rowDividers=&#123;false&#125;</code> — hides the bottom border between all rows table-wide.
        </p>
        <div style={cardStyle}><NoRowDividersDemo density={density} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>No Dividers</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Both <code>columnDividers=&#123;false&#125;</code> and <code>rowDividers=&#123;false&#125;</code>.
        </p>
        <div style={cardStyle}><NoDividersDemo density={density} /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Cell-level Divider Overrides</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Table has <code>columnDividers=&#123;false&#125;</code>, but the "Name" column sets{" "}
          <code>dividerRight=&#123;true&#125;</code> to restore its right border. The "Age" column
          sets <code>dividerBottom=&#123;false&#125;</code> to hide its bottom border.
        </p>
        <div style={cardStyle}><CellOverrideDividersDemo density={density} /></div>
      </section>
      </div>
    </div>
  );
}
