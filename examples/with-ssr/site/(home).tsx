export default function Home() {
  return (
    <div class="max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img
        class="w-full h-48 object-cover"
        src="https://placecats.com/400/250"
        alt="Cute kitten"
      />
      <div class="p-6">
        <h2 class="text-xl font-semibold text-gray-800">Beautiful Card</h2>
        <p class="mt-2 text-gray-600">
          This is a modern card component using Tailwind CSS. You can use it for
          blog posts, features, or anything else.
        </p>
        <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          Learn More
        </button>
      </div>
    </div>
  );
}
