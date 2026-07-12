import React, { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import Navbar from "../../components/Navbar.jsx";
import { GlassCard, Modal, Alert, EmptyState } from "../../components/Common.jsx";
import { formatDisplayDate, todayISO } from "../../utils/dateHelpers.js";

const emptyForm = {
  name: "", email: "", mobile: "", employeeId: "", role: "employee",
  status: "active", joiningDate: todayISO(), targetSales: "", photoURL: "",
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "employees"));
    setEmployees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, employeeId: `GM-${1000 + employees.length + 1}` });
    setError("");
    setModalOpen(true);
  }

  function openEdit(emp) {
    setEditingId(emp.id);
    setForm({
      name: emp.name, email: emp.email, mobile: emp.mobile, employeeId: emp.employeeId,
      role: emp.role, status: emp.status, joiningDate: emp.joiningDate || todayISO(),
      targetSales: emp.target?.sales || "", photoURL: emp.photoURL || "",
    });
    setError("");
    setModalOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
        employeeId: form.employeeId.trim(),
        role: form.role,
        status: form.status,
        joiningDate: form.joiningDate,
        target: { sales: Number(form.targetSales) || 0 },
        photoURL: form.photoURL || "",
      };
      if (editingId) {
        await updateDoc(doc(db, "employees", editingId), payload);
      } else {
        await setDoc(doc(db, "employees", form.employeeId.trim()), { ...payload, uid: null, createdAt: new Date() });
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(emp) {
    await updateDoc(doc(db, "employees", emp.id), { status: emp.status === "active" ? "inactive" : "active" });
    load();
  }

  async function remove(emp) {
    if (!confirm(`Delete ${emp.name}? This cannot be undone.`)) return;
    await deleteDoc(doc(db, "employees", emp.id));
    load();
  }

  const filtered = employees.filter((e) =>
    !search ||
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Navbar title="Employees" />
      <div className="page">
        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <input className="input" style={{ maxWidth: 280 }} placeholder="Search by name, email, ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-primary" onClick={openAdd}>+ Add Employee</button>
        </div>

        <GlassCard style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 24, color: "var(--text-mid)" }}>Loading employees…</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No employees found" hint="Add your first employee to get started." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th><th>ID</th><th>Email</th><th>Mobile</th><th>Role</th><th>Status</th><th>Target</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td className="mono">{emp.employeeId}</td>
                      <td>{emp.email}</td>
                      <td className="mono">{emp.mobile}</td>
                      <td><span className="badge badge-gold">{emp.role}</span></td>
                      <td><span className={`badge ${emp.status === "active" ? "badge-active" : "badge-inactive"}`}>{emp.status}</span></td>
                      <td className="mono">₹{(emp.target?.sales || 0).toLocaleString("en-IN")}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(emp)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(emp)}>
                            {emp.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(emp)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Employee" : "Add Employee"} width={520}>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {error && <Alert type="error">{error}</Alert>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Full name</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Employee ID</label>
              <input className="input" required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} disabled={!!editingId} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Gmail address</label>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field">
              <label>Mobile number</label>
              <input className="input" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91XXXXXXXXXX" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Role (label only)</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Joining date</label>
              <input className="input" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
            </div>
            <div className="field">
              <label>Monthly sales target (₹)</label>
              <input className="input" type="number" min="0" value={form.targetSales} onChange={(e) => setForm({ ...form, targetSales: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Profile photo URL (optional)</label>
            <input className="input" value={form.photoURL} onChange={(e) => setForm({ ...form, photoURL: e.target.value })} />
          </div>
          <p style={{ fontSize: 11.5, color: "var(--text-low)" }}>
            Note: setting Role to Admin here is a display label only. Real admin access is granted
            separately by adding a document to the <code>admins</code> collection in the Firebase console,
            keyed by that person's Firebase Auth UID — see README for steps.
          </p>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : "Add employee"}</button>
        </form>
      </Modal>
    </div>
  );
}
