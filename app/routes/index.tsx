import * as fs from "fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { useState } from "react";

const tasksFilePath = "tasks.txt";

async function readTasks() {
  const fileData = await fs.promises
    .readFile(tasksFilePath, "utf-8")
    .catch(() => "[]");
  return JSON.parse(fileData);
}

async function writeTasks(tasks: string[]) {
  await fs.promises.writeFile(tasksFilePath, JSON.stringify(tasks));
}

const getTasks = createServerFn("GET", () => {
  return readTasks();
});

const addTask = createServerFn("POST", async (task: string) => {
  const tasks = await readTasks();
  tasks.push(task);
  await writeTasks(tasks);
});

const deleteTask = createServerFn("POST", async (index: number) => {
  const tasks = await readTasks();
  tasks.splice(index, 1);
  await writeTasks(tasks);
});

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getTasks(),
});

function Home() {
  const router = useRouter();
  const tasks = Route.useLoaderData();
  const [task, setTask] = useState("");

  return (
    <div className=" bg-gradient-to-r from-orange-400 to-red-600 h-screen flex items-center justify-center">
      <div className=" flex flex-col gap-4">
        <h1 className=" font-bold text-3xl text-center">To-Do List</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (task.trim()) {
              addTask(task).then(() => {
                setTask("");
                router.invalidate();
              });
            }
          }}
          className=" flex flex-row gap-2"
        >
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter new task"
            className=" placeholder:text-black focus:outline-none p-2 rounded-xl shadow-md hover:shadow-2xl bg-white/5 transition duration-300 ease-in-out hover:bg-white/15 focus:bg-white/15 focus:shadow-2xl"
          />
          <button
            type="submit"
            className=" rounded-full  size-[40px] bg-white/5 text-lg text-center shadow-md hover:shadow-2xl transition duration-300 ease-in-out hover:bg-white/15 hover:scale-105"
          >
            +
          </button>
        </form>
        <ul className=" flex flex-col gap-4 p-4 rounded-lg bg-white/10 h-[250px] overflow-hidden overflow-y-scroll">
          {tasks.length === 0 ? (
            <li>No tasks</li>
          ) : (
            tasks.map((task, index) => (
              <li
                key={index}
                className=" flex items-center justify-between bg-white/15 p-2 rounded-lg"
              >
                <span>{task}</span>
                <svg
                  onClick={() => {
                    deleteTask(index).then(() => {
                      router.invalidate();
                    });
                  }}
                  className="cursor-pointer hover:scale-110 transition duration-300 ease-in-out stroke-current text-black hover:text-red-700"
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
