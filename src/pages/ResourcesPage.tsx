import { FileSpreadsheet, ShieldCheck, FileText, Download } from 'lucide-react';
import { RESOURCES } from '../data/content';
import { PageHero } from '../components/shared';
import { useToast } from '../components/toast';
import { useCmsDocuments } from '../lib/cms/store';

const GROUP_ICONS = [FileSpreadsheet, ShieldCheck, FileText];

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// Factsheet titles carry their period as "… — August 2026". Parse it into a
// sortable value (year*12+month) so we can surface only the latest month's set.
// Returns -1 when no month/year can be read.
function factsheetPeriod(title: string): number {
  const m = title.match(/([A-Za-z]{3,})\s+(\d{4})/);
  if (!m) return -1;
  const month = MONTHS[m[1].slice(0, 3).toLowerCase()];
  const year = parseInt(m[2], 10);
  if (month === undefined || !year) return -1;
  return year * 12 + month;
}

function fileBadge(type?: string): string {
  if (!type) return 'FILE';
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('image')) return 'IMG';
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return 'XLS';
  if (type.includes('word') || type.includes('document')) return 'DOC';
  return 'FILE';
}

export default function ResourcesPage() {
  const showToast = useToast();
  const documents = useCmsDocuments();

  // Each card pulls live CMS documents from its mapped categories (managed in
  // the Console); if none are uploaded yet, the static fallback list is shown.
  const groups = RESOURCES.groups.map((group, idx) => {
    const cats = group.categories as readonly string[];
    let docs = documents.filter((d) => cats.includes(d.category));
    // Factsheets: show only the latest month's uploads (e.g. once Aug 2026 is
    // up, July drops off). Other categories in the same card (e.g. the product
    // deck) are always shown. Falls back to all when no periods can be parsed.
    if (cats.includes('Monthly factsheets')) {
      const sheets = docs.filter((d) => d.category === 'Monthly factsheets');
      const others = docs.filter((d) => d.category !== 'Monthly factsheets');
      const latest = sheets.reduce((max, d) => Math.max(max, factsheetPeriod(d.title)), -1);
      const latestSheets = latest >= 0 ? sheets.filter((d) => factsheetPeriod(d.title) === latest) : sheets;
      docs = [...latestSheets, ...others];
    }
    return {
      title: group.title,
      body: group.body,
      Icon: GROUP_ICONS[idx % GROUP_ICONS.length],
      docs,
      fallback: group.items,
    };
  });

  const placeholder = (item: string) =>
    showToast(`"${item}" will be available for download once documents are uploaded to the portal.`);

  return (
    <>
      <PageHero
        eyebrow="RESOURCES & DOWNLOADS"
        title={
          <>
            Document <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink-700 to-accent-600">Hub</span>
          </>
        }
        lead="Product Decks • Factsheets • Compliance & Disclosures • Onboarding Forms"
      />

      <section className="py-20 bg-white font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {groups.map((group) => {
              const Icon = group.Icon;
              return (
                <div
                  key={group.title}
                  className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                      <Icon className="w-5 h-5 text-ink-700" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl text-slate-900">{group.title}</h3>
                      <p className="text-[11px] text-slate-500 font-light">{group.body}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {group.docs.length > 0
                      ? group.docs.map((item) =>
                          item.fileUrl ? (
                            <a
                              key={item.id}
                              href={item.fileUrl}
                              download={item.fileName ?? item.title}
                              className="w-full flex items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-ink-400 transition text-left group"
                            >
                              <span className="text-xs font-semibold text-slate-800">
                                {item.title}
                                {item.strategy ? (
                                  <span className="text-slate-400 font-normal"> · {item.strategy}</span>
                                ) : null}
                              </span>
                              <span className="flex items-center gap-1.5 text-[10px] font-mono text-accent-600 border border-slate-200 rounded-md px-2 py-1 group-hover:bg-accent-50 transition shrink-0">
                                <Download className="w-3 h-3" /> {fileBadge(item.fileType)}
                              </span>
                            </a>
                          ) : (
                            <button
                              key={item.id}
                              onClick={() => placeholder(item.title)}
                              className="w-full flex items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-ink-400 transition text-left group"
                            >
                              <span className="text-xs font-semibold text-slate-800">{item.title}</span>
                              <span className="flex items-center gap-1.5 text-[10px] font-mono text-accent-600 border border-slate-200 rounded-md px-2 py-1 group-hover:bg-accent-50 transition shrink-0">
                                <Download className="w-3 h-3" /> PDF
                              </span>
                            </button>
                          ),
                        )
                      : group.fallback.map((item) => (
                          <button
                            key={item}
                            onClick={() => placeholder(item)}
                            className="w-full flex items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-ink-400 transition text-left group"
                          >
                            <span className="text-xs font-semibold text-slate-800">{item}</span>
                            <span className="flex items-center gap-1.5 text-[10px] font-mono text-accent-600 border border-slate-200 rounded-md px-2 py-1 group-hover:bg-accent-50 transition shrink-0">
                              <Download className="w-3 h-3" /> PDF
                            </span>
                          </button>
                        ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
