import Link from "next/link";

export function Features() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-blue-600"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

      <div className="relative max-w-4xl mx-auto px-6 text-center text-white z-10">
        <h3 className="text-4xl md:text-5xl font-extrabold mb-6">
          Илүү ихийг хямдралтайгаар
        </h3>
        <p className="text-xl text-teal-100 mb-10 leading-relaxed">
          Яг одоо бүртгүүлээд шинээр ирсэн бүтээгдэхүүн болон онцгой урамшууллын мэдээллийг хамгийн түрүүнд аваарай.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/register">
            <button className="w-full sm:w-auto bg-white text-teal-600 px-8 py-4 rounded-full font-bold hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Одоо бүртгүүлэх
            </button>
          </Link>
          <Link href="/product">
            <button className="w-full sm:w-auto border border-teal-300/50 bg-teal-500/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold hover:bg-teal-500/40 transition-all duration-300">
              Бүтээгдэхүүн үзэх
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
