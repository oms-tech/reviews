import { useEffect, useMemo, useState } from 'react';

import type { NextPage } from 'next';
import { useRouter } from 'next/router';

import { Combobox } from '@headlessui/react';

import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';

import classNames from 'classnames';

import { Course, Review, Semester } from '../../src/@types';
import { getCourseNames, getRecentSemesters } from '../../src/sanity';

type CourseLabel = Pick<Course, 'id' | 'code' | 'name'>;

const NewReviewForm: NextPage = function NewReviewForm() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [courseLabels, setCourseLabels] = useState<CourseLabel[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [courseId, setCourseId] = useState<Course['id']>();
  const [semesterId, setSemesterId] = useState<Semester['id']>();
  const [rating, setRating] = useState<NonNullable<Review['rating']>>();
  const [difficulty, setDifficulty] = useState<NonNullable<Review['difficulty']>>();
  const [workload, setWorkload] = useState<NonNullable<Review['workload']>>();
  const [body, setBody] = useState<Review['body']>();

  const [username, setUsername] = useState<string>();
  const [code, setCode] = useState<string>();

  const selectedCourseLabel = useMemo<CourseLabel | null>(
    () => courseLabels.find((course) => course.id === courseId) ?? null,
    [courseId, courseLabels],
  );

  useEffect(() => {
    (async () => {
      setSemesters(await getRecentSemesters());
    })();
  });

  useEffect(() => {
    (async () => {
      setCourseLabels(await getCourseNames());
    })();
  }, []);

  useEffect(() => {
    const { course: courseCode } = router.query;

    if (typeof courseCode === 'string') {
      setCourseId(
        courseLabels.find((course) => course.code === courseCode)?.id,
      );
    }
  }, [router, courseLabels]);

  const filteredCourses = useMemo(
    () => (query === ''
      ? courseLabels
      : courseLabels.filter((course) => course.name.toLowerCase().includes(query.toLowerCase()))),
    [query, courseLabels],
  );

  return (
    <main className="bg-white py-10 px-5 sm:px-20 max-w-2xl mt-10 mx-auto">
      <div className="space-y-8 divide-y divide-gray-200">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Add A Review
              {' '}
              {selectedCourseLabel ? `for ${selectedCourseLabel.code}` : ''}
            </h1>
          </div>
        </div>
        <form className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200">
            <div className="pt-8">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Course
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Let&apos;s start with some information about the course want
                  to review.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <Combobox as="div" value={courseId} onChange={setCourseId}>
                    <Combobox.Label className="block text-sm font-medium text-gray-700">
                      Course Name
                    </Combobox.Label>
                    <div className="relative mt-1">
                      <Combobox.Input
                        required
                        className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        onChange={(event) => setQuery(event.target.value)}
                        displayValue={() => selectedCourseLabel?.name ?? ''}
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <SelectorIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>

                      {filteredCourses.length > 0 && (
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {filteredCourses.map((course) => (
                            <Combobox.Option
                              key={course.id}
                              value={course.id}
                              className={({ active }) => classNames(
                                'relative cursor-default select-none py-2 pl-3 pr-9',
                                {
                                  'bg-indigo-600 text-white': active,
                                  'text-gray-900': !active,
                                },
                              )}
                            >
                              {({ active, selected }) => (
                                <>
                                  <span
                                    className={classNames('block truncate', {
                                      'font-semibold': selected,
                                    })}
                                  >
                                    {course.name}
                                  </span>

                                  {selected && (
                                    <span
                                      className={classNames(
                                        'absolute inset-y-0 right-0 flex items-center pr-4',
                                        {
                                          'text-white': active,
                                          'text-indigo-600': !active,
                                        },
                                      )}
                                    >
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  )}
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                    </div>
                  </Combobox>
                </div>
              </div>
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-900">
                  Semester
                </label>
                <p className="text-sm leading-5 text-gray-500">
                  When did you take
                  {' '}
                  {selectedCourseLabel?.code ?? 'this course'}
                  ?
                </p>
                <fieldset className="mt-4">
                  <legend className="sr-only">Semester selection</legend>
                  <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                    {semesters.map(({ id, term, startDate }) => (
                      <div className="flex items-center" key={id}>
                        <input
                          required
                          checked={semesterId === id}
                          onChange={() => setSemesterId(id)}
                          id={`semester-${term}-${startDate}`}
                          name="semester"
                          type="radio"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <label
                          htmlFor={`semester-${id}`}
                          className="ml-3 block text-sm font-medium text-gray-700 capitalize"
                        >
                          {term}
                          {' '}
                          {new Date(startDate).getFullYear()}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
            <div className="pt-8">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Review
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Please share your experience along with some quick stats about
                  {' '}
                  {selectedCourseLabel?.code ?? 'this course'}
                  .
                </p>
              </div>
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-900">
                  Rating
                </label>
                <p className="text-sm leading-5 text-gray-500">
                  Overall, how would you rate
                  {' '}
                  {selectedCourseLabel?.code ?? 'this course'}
                  {' '}
                  on a scale of
                  1-5?
                </p>
                <fieldset className="mt-4">
                  <legend className="sr-only">Course rating</legend>
                  <div className="flex items-center space-x-7 md:space-x-10">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div className="flex items-center" key={num}>
                        <input
                          required
                          id={`rating-${num}`}
                          name="rating"
                          type="radio"
                          checked={rating === num}
                          onChange={() => setRating(num)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <label
                          htmlFor={`rating-${num}`}
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          {num}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-900">
                  Difficulty
                </label>
                <p className="text-sm leading-5 text-gray-500">
                  How difficult was
                  {' '}
                  {selectedCourseLabel?.code ?? 'this course'}
                  {' '}
                  on a scale of 1-5?
                </p>
                <fieldset className="mt-4">
                  <legend className="sr-only">Course difficulty</legend>
                  <div className="flex items-center space-x-7 md:space-x-10">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div className="flex items-center" key={num}>
                        <input
                          required
                          id={`difficulty-${num}`}
                          name="difficulty"
                          type="radio"
                          checked={difficulty === num}
                          onChange={() => setDifficulty(num)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <label
                          htmlFor={`rating-${num}`}
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          {num}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="mt-6">
                <label
                  htmlFor="workload"
                  className="block text-sm font-medium text-gray-700"
                >
                  Workload
                </label>
                <div className="mt-1 relative rounded-md shadow-sm w-1/2">
                  <input
                    required
                    type="number"
                    inputMode="numeric"
                    name="workload"
                    min={1}
                    max={100}
                    value={workload ?? ''}
                    onChange={(e) => {
                      if (!e.currentTarget.value) {
                        setWorkload(undefined);
                      } else if (+e.currentTarget.value) {
                        setWorkload(+e.currentTarget.value);
                      }
                    }}
                    id="workload"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-28 sm:text-sm border-gray-300 rounded-md"
                    aria-describedby="workload-unit"
                    placeholder="12"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      hours / week
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500" id="workload-unit">
                  How much time
                  {' '}
                  <span className="sr-only">(in hours per week)</span>
                  {' '}
                  did you
                  invest in
                  {' '}
                  {selectedCourseLabel?.code ?? 'this course'}
                  ?
                </p>
              </div>
              <div className="mt-6">
                <label
                  htmlFor="body"
                  className="block text-sm font-medium text-gray-700"
                >
                  Review
                </label>
                <div className="mt-1">
                  <textarea
                    required
                    id="body"
                    name="body"
                    value={body}
                    onChange={(e) => setBody(e.currentTarget.value)}
                    rows={6}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  So, how was
                  {' '}
                  {selectedCourseLabel?.code ?? 'the course'}
                  ?
                </p>
              </div>
            </div>
            <div className="pt-8">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Authentication
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Only verified GATech students can leave reviews at this time.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    GT Account
                  </label>
                  <div className="mt-1 flex">
                    <input
                      required
                      type="text"
                      name="username"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.currentTarget.value)}
                      autoComplete="none"
                      placeholder="mschlenker3"
                      className="relative focus:ring-indigo-500 focus:border-indigo-500 block min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      @gatech.edu
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Who are you, fellow student?
                  </p>
                </div>
                <div className="sm:col-span-6">
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Code
                  </label>
                  <div className="mt-1">
                    <input
                      required
                      type="text"
                      name="code"
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.currentTarget.value)}
                      autoComplete="none"
                      placeholder="123456"
                      className="relative focus:ring-indigo-500 focus:border-indigo-500 block min-w-0 rounded sm:text-sm border-gray-300"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Please enter the six digit code we sent you.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default NewReviewForm;
