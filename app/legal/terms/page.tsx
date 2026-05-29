import { redirect } from 'next/navigation';

/** Terms live in the site footer (Terms button). No duplicate full page. */
export default function TermsPage() {
  redirect('/');
}
