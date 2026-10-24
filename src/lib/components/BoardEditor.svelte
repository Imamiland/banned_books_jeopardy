<script lang="ts">
  import { CATEGORY_COUNT, QUESTION_COUNT, VALUES } from '$lib/constants';

  interface InitialData {
    title?: string;
    description?: string | null;
    published?: boolean;
    categories?: {
      name: string;
      questions: { question: string; answer: string; timeLimit: number }[];
    }[];
  }

  interface Props {
    initial?: InitialData;
  }

  let { initial }: Props = $props();

  let title = $state(initial?.title ?? '');
  let description = $state(initial?.description ?? '');
  let published = $state(initial?.published ?? false);

  let categoryNames = $state<string[]>(
    Array.from({ length: CATEGORY_COUNT }, (_, i) => initial?.categories?.[i]?.name ?? '')
  );

  let questionTexts = $state<string[][]>(
    Array.from({ length: CATEGORY_COUNT }, (_, i) =>
      Array.from(
        { length: QUESTION_COUNT },
        (_, j) => initial?.categories?.[i]?.questions?.[j]?.question ?? ''
      )
    )
  );

  let answerTexts = $state<string[][]>(
    Array.from({ length: CATEGORY_COUNT }, (_, i) =>
      Array.from(
        { length: QUESTION_COUNT },
        (_, j) => initial?.categories?.[i]?.questions?.[j]?.answer ?? ''
      )
    )
  );

  let timeLimits = $state<number[][]>(
    Array.from({ length: CATEGORY_COUNT }, (_, i) =>
      Array.from(
        { length: QUESTION_COUNT },
        (_, j) => initial?.categories?.[i]?.questions?.[j]?.timeLimit ?? 30
      )
    )
  );
</script>

<div class="mx-auto max-w-5xl space-y-8 p-8">
  <div class="space-y-4">
    <div>
      <label
        for="title"
        class="mb-1 block font-semibold text-white">Board Title</label
      >
      <input
        id="title"
        name="title"
        type="text"
        bind:value={title}
        required
        class="w-full rounded border border-yellow-400 bg-blue-800 px-3 py-2 text-white"
      />
    </div>

    <div>
      <label
        for="description"
        class="mb-1 block font-semibold text-white">Description</label
      >
      <textarea
        id="description"
        name="description"
        bind:value={description}
        rows="3"
        class="w-full rounded border border-yellow-400 bg-blue-800 px-3 py-2 text-white"
      ></textarea>
    </div>

    <label class="flex items-center gap-2 text-white">
      <input
        type="checkbox"
        name="published"
        bind:checked={published}
        class="h-4 w-4"
      />
      <span>Publish board (visible to public)</span>
    </label>
  </div>

  {#each categoryNames as _, i}
    <fieldset class="space-y-4 rounded-lg border border-yellow-400 bg-blue-900 p-4">
      <legend class="px-2 font-bold text-yellow-400">Category {i + 1}</legend>

      <div>
        <label
          for={`category-${i}-name`}
          class="mb-1 block text-sm font-semibold text-white"
        >
          Category Name
        </label>
        <input
          id={`category-${i}-name`}
          name={`category-${i}-name`}
          type="text"
          bind:value={categoryNames[i]}
          class="w-full rounded border border-yellow-400 bg-blue-800 px-3 py-2 text-white"
        />
      </div>

      <div class="space-y-4">
        {#each VALUES as value, j}
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-1 text-center font-bold text-yellow-400">{value}</div>
            <div class="col-span-4">
              <label
                for={`question-${i}-${j}-question`}
                class="mb-1 block text-xs text-white opacity-75"
              >
                Question
              </label>
              <input
                id={`question-${i}-${j}-question`}
                name={`question-${i}-${j}-question`}
                type="text"
                bind:value={questionTexts[i][j]}
                class="w-full rounded border border-yellow-400 bg-blue-800 px-2 py-1 text-white"
              />
            </div>
            <div class="col-span-4">
              <label
                for={`question-${i}-${j}-answer`}
                class="mb-1 block text-xs text-white opacity-75"
              >
                Answer
              </label>
              <input
                id={`question-${i}-${j}-answer`}
                name={`question-${i}-${j}-answer`}
                type="text"
                bind:value={answerTexts[i][j]}
                class="w-full rounded border border-yellow-400 bg-blue-800 px-2 py-1 text-white"
              />
            </div>
            <div class="col-span-3">
              <label
                for={`question-${i}-${j}-timeLimit`}
                class="mb-1 block text-xs text-white opacity-75"
              >
                Time (s)
              </label>
              <input
                id={`question-${i}-${j}-timeLimit`}
                name={`question-${i}-${j}-timeLimit`}
                type="number"
                min="1"
                bind:value={timeLimits[i][j]}
                class="w-full rounded border border-yellow-400 bg-blue-800 px-2 py-1 text-white"
              />
            </div>
          </div>
        {/each}
      </div>
    </fieldset>
  {/each}
</div>
