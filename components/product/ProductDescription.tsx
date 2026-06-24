export default function ProductDescription({ html }: { html?: string }) {
  if (!html) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">توضیحات محصول</h2>
      <div
        className="prose prose-sm max-w-none text-gray-700 leading-relaxed
          [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5
          [&_table]:w-full [&_table]:border-collapse [&_th]:bg-gray-50 [&_th]:p-2 [&_td]:p-2 [&_td]:border [&_th]:border
          [&_img]:rounded-xl [&_img]:max-w-full"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
