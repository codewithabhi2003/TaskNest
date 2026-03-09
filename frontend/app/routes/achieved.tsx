import { useGetMyTasksQuery } from "@/hooks/use-task";
import { Loader } from "@/components/loader";
import type { Task } from "@/types";
import { format } from "date-fns";
import { Link, useSearchParams } from "react-router";

const Achieved = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const { data: tasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  if (isLoading) return <Loader />;

  const archivedTasks =
    tasks?.filter(
      (task) =>
        task.isArchived &&
        (!workspaceId || task.project.workspace.toString() === workspaceId)
    ) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Archived Tasks</h1>

      {archivedTasks.length === 0 && (
        <p className="text-muted-foreground">No archived tasks found.</p>
      )}

      {archivedTasks.map((task) => (
        <div key={task._id} className="p-4 border rounded-lg">
          <Link
            to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
            className="font-medium hover:underline"
          >
            {task.title}
          </Link>

          {task.dueDate && (
            <div className="text-sm text-muted-foreground mt-1">
              Due: {format(task.dueDate, "PPPP")}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Achieved;