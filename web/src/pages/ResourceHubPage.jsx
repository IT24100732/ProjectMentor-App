import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createResource,
  deleteResource,
  getResourceFacets,
  searchResources,
  updateResource,
} from '../api/projectMentorApi';
import { useAuth } from '../auth/AuthContext';

const PAGE_SIZE = 6;
const SORT_OPTIONS = [
  ['title', 'asc', 'Title (A–Z)'],
  ['title', 'desc', 'Title (Z–A)'],
  ['topic', 'asc', 'Topic (A–Z)'],
  ['type', 'asc', 'Type'],
  ['createdat', 'desc', 'Newest first'],
];

const emptyForm = { title: '', url: '', resourceType: 'Article', topic: '', description: '', tags: '' };

function getErrorMessage(error) {
  if (error.code === 'API_UNREACHABLE') return error.message;
  return error.message || 'Something went wrong. Please try again.';
}

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function ResourceCard({ resource, canManage, onEdit, onDelete, busy }) {
  return (
    <article className="resource-card">
      <div className="resource-card-head">
        <span className="resource-type-badge">{resource.resourceType}</span>
        <span className="resource-topic">{resource.topic}</span>
      </div>
      <h3><a href={resource.url} target="_blank" rel="noreferrer noopener">{resource.title}</a></h3>
      {resource.description && <p className="resource-description">{resource.description}</p>}
      {resource.tags?.length > 0 && (
        <div className="resource-tags">{resource.tags.map(tag => <span className="resource-tag" key={tag}>{tag}</span>)}</div>
      )}
      <div className="resource-card-foot">
        <a className="resource-link" href={resource.url} target="_blank" rel="noreferrer noopener">Open resource →</a>
        {canManage && (
          <span className="resource-admin-actions">
            <button type="button" className="button button-quiet button-small" onClick={() => onEdit(resource)} disabled={busy}>Edit</button>
            <button type="button" className="button button-danger button-small" onClick={() => onDelete(resource)} disabled={busy}>Delete</button>
          </span>
        )}
      </div>
    </article>
  );
}

function ResourceForm({ initial, onSubmit, onCancel, types, busy }) {
  const [form, setForm] = useState(initial);
  useEffect(() => { setForm(initial); }, [initial]);

  function update(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      title: form.title,
      url: form.url,
      resourceType: form.resourceType,
      topic: form.topic,
      description: form.description || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
  }

  return (
    <form className="resource-form" onSubmit={submit}>
      <h2>{form.id ? 'Edit resource' : 'Add a resource'}</h2>
      <div className="resource-form-grid">
        <label className="form-field">Title<input name="title" value={form.title} onChange={update} required /></label>
        <label className="form-field">URL<input name="url" type="url" value={form.url} onChange={update} placeholder="https://..." required /></label>
        <label className="form-field">Type<select name="resourceType" value={form.resourceType} onChange={update}>{types.map(type => <option key={type} value={type}>{type}</option>)}</select></label>
        <label className="form-field">Topic<input name="topic" value={form.topic} onChange={update} required /></label>
        <label className="form-field resource-form-wide">Description<input name="description" value={form.description} onChange={update} placeholder="Optional short summary" /></label>
        <label className="form-field resource-form-wide">Tags<input name="tags" value={form.tags} onChange={update} placeholder="Comma separated, e.g. react, hooks" /></label>
      </div>
      <div className="hero-actions">
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Saving...' : (form.id ? 'Save changes' : 'Add resource')}</button>
        <button className="button button-quiet" type="button" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}

export default function ResourceHubPage() {
  const { token, user } = useAuth();
  const canManage = user?.role === 'Admin';

  const [facets, setFacets] = useState({ topics: [], types: [], tags: [] });
  const [searchInput, setSearchInput] = useState('');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const [page, setPage] = useState(1);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formInitial, setFormInitial] = useState(null);
  const [saving, setSaving] = useState(false);

  const debouncedSearch = useDebounced(searchInput, 350);
  const [sortBy, sortDir] = SORT_OPTIONS[sortIndex];

  useEffect(() => {
    getResourceFacets(token).then(setFacets).catch(() => { /* filters are optional; ignore */ });
  }, [token]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await searchResources(token, {
        search: debouncedSearch, topic, type, sortBy, sortDir, page, pageSize: PAGE_SIZE,
      });
      setResult(data);
    } catch (exception) {
      setError(getErrorMessage(exception));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, topic, type, sortBy, sortDir, page]);

  useEffect(() => { load(); }, [load]);

  // Any filter change resets to the first page.
  useEffect(() => { setPage(1); }, [debouncedSearch, topic, type, sortIndex]);

  const activeFilters = useMemo(
    () => Boolean(debouncedSearch || topic || type),
    [debouncedSearch, topic, type],
  );

  async function handleSave(payload) {
    setSaving(true);
    setError('');
    try {
      if (formInitial?.id) await updateResource(token, formInitial.id, payload);
      else await createResource(token, payload);
      setFormInitial(null);
      await load();
    } catch (exception) {
      setError(getErrorMessage(exception));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(resource) {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;
    setSaving(true);
    setError('');
    try {
      await deleteResource(token, resource.id);
      await load();
    } catch (exception) {
      setError(getErrorMessage(exception));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(resource) {
    setFormInitial({
      id: resource.id,
      title: resource.title,
      url: resource.url,
      resourceType: resource.resourceType,
      topic: resource.topic,
      description: resource.description ?? '',
      tags: (resource.tags ?? []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const items = result?.items ?? [];
  const totalPages = result?.totalPages ?? 0;
  const totalItems = result?.totalItems ?? 0;

  return (
    <main className="page page-wide">
      <div className="page-head">
        <div>
          <p className="eyebrow">Resource hub</p>
          <h1>Find the right help.</h1>
          <p className="page-lede">Curated tutorials, documentation, videos and courses — organized by topic so you can jump straight to what a milestone needs.</p>
        </div>
        <Link className="button button-quiet" to={canManage ? '/admin' : '/student'}>Back</Link>
      </div>

      {canManage && (
        formInitial
          ? <section className="panel"><ResourceForm initial={formInitial} onSubmit={handleSave} onCancel={() => setFormInitial(null)} types={facets.types.length ? facets.types : ['Article', 'Video', 'Documentation', 'Course']} busy={saving} /></section>
          : <div className="resource-toolbar"><button className="button button-primary" type="button" onClick={() => setFormInitial({ ...emptyForm })}>+ Add resource</button></div>
      )}

      <section className="panel">
        <div className="resource-filters">
          <label className="form-field">Search
            <input type="search" value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Search title, topic or description..." />
          </label>
          <label className="form-field">Topic
            <select value={topic} onChange={event => setTopic(event.target.value)}>
              <option value="">All topics</option>
              {facets.topics.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="form-field">Type
            <select value={type} onChange={event => setType(event.target.value)}>
              <option value="">All types</option>
              {facets.types.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="form-field">Sort by
            <select value={sortIndex} onChange={event => setSortIndex(Number(event.target.value))}>
              {SORT_OPTIONS.map(([, , label], index) => <option key={label} value={index}>{label}</option>)}
            </select>
          </label>
        </div>
        {activeFilters && (
          <div className="resource-active">
            <span>{loading ? 'Searching…' : `${totalItems} result${totalItems === 1 ? '' : 's'}`}</span>
            <button type="button" className="resource-clear" onClick={() => { setSearchInput(''); setTopic(''); setType(''); }}>Clear filters</button>
          </div>
        )}
      </section>

      {error && <p className="error-message" role="alert">{error}</p>}

      {loading && !result && <section className="panel"><p>Loading resources…</p></section>}

      {!loading && items.length === 0 && !error && (
        <section className="panel resource-empty">
          <h2>No resources found</h2>
          <p>{activeFilters ? 'Try a different search term or clear the filters.' : 'The catalog is empty. An admin can add the first resource.'}</p>
        </section>
      )}

      {items.length > 0 && (
        <>
          <div className="resource-grid">
            {items.map(resource => (
              <ResourceCard key={resource.id} resource={resource} canManage={canManage} onEdit={startEdit} onDelete={handleDelete} busy={saving} />
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="resource-pagination" aria-label="Resource pages">
              <button type="button" className="button button-quiet button-small" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>← Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button type="button" className="button button-quiet button-small" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>Next →</button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
