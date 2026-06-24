import type { LabeledSpecification } from '@/lib/types';

export default function ProductSpecifications({
  specs,
}: {
  specs: LabeledSpecification[];
}) {
  if (!specs.length) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">مشخصات فنی</h2>
      <table className="w-full text-sm">
        <tbody>
          {specs.map((spec, i) => (
            <tr
              key={spec.key}
              className={i % 2 === 0 ? 'bg-gray-50/80' : 'bg-white'}
            >
              <th className="py-3 px-4 text-start font-semibold text-gray-600 w-2/5 sm:w-1/3">
                {spec.label}
              </th>
              <td className="py-3 px-4 text-gray-800">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
