import { showcaseTours } from "@/components/site-data";
import { Button } from "@/components/ui";

export default function AdminToursPage() {
  return <div className="admin-content">
    <section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Legacy catalog</p><h2>Current public tours</h2></div><p>These source-defined tours remain visible on the public site while the new package catalog is populated.</p></div><div className="admin-table-wrap"><table><thead><tr><th>Package</th><th>Destination</th><th>Duration</th><th>Public page</th></tr></thead><tbody>{showcaseTours.map(tour => <tr key={tour.slug}><td><div className="admin-table-name"><img src={tour.image} alt="" /><strong>{tour.name}</strong></div></td><td>{tour.destination}</td><td>{tour.duration}</td><td><a href={`/tours/${tour.slug}`}>View <span aria-hidden="true">→</span></a></td></tr>)}</tbody></table></div></section>
    <section className="admin-empty"><p className="eyebrow">Package management</p><h2>Create and manage packages in the new catalog.</h2><p>Admins can create, edit, publish or permanently delete database-backed packages. Public-tour migration is separate so the existing catalog remains stable.</p><Button href="/admin/packages">Manage packages</Button></section>
  </div>;
}
