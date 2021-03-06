const Queue = require('./Queue'); 
const { 
	  SchedulerInterrupt,
    QueueType,
    PRIORITY_LEVELS,
} = require('./constants/index');

// A class representing the scheduler
// It holds a single blocking queue for blocking processes and three running queues 
// for non-blocking processes
class Scheduler { 
    constructor() { 
        this.clock = Date.now();
        this.blockingQueue = new Queue(this, 50, 0, QueueType.BLOCKING_QUEUE);
        this.runningQueues = [];
        // Initialize all the CPU running queues
        for (let i = 0; i < PRIORITY_LEVELS; i++) {
            this.runningQueues[i] = new Queue(this, 10 + i * 20, i, QueueType.CPU_QUEUE);
        }
    }

    // Executes the scheduler in an infinite loop as long as there are processes in any of the queues
    // Calculate the time slice for the next iteration of the scheduler by subtracting the current
    // time from the clock property. Don't forget to update the clock property afterwards.
    // On every iteration of the scheduler, if the blocking queue is not empty, blocking work
    // should be done. Once the blocking work has been done, perform some CPU work in the same iteration.
    run() {
     while (1) {
		   const currentTime = Data.now();
			 const timeSlice = currentTime - this.clock;
			 this.clock = currentTime;
			 if (!this.blockingQueue.isEmpty()) {
			     this.blockingQueue.doBlockingWork(timeSlice);
			 }
			 if (this.blockingQueue.isEmpty()) {
			     console.log("Blocking queue is empty");
			 this.runningQueues.forEach(queue => { 
					 if (!queue.isEmpty()) queue.doCPUWork(timeSlice);
					});
			     let runningQueuesAreEmpty = true;
					 this.runningQueues.forEach(queue => {
						if (!queue.isEmpty()) {
						   console.log("Found a queue that's still running! Queue : ", queue);
							 return runningQueuesAreEmpty = false;
						 }
					})
					 if (runningQueuesAreEmpty) console.log("Running queues are empty!")

			     if (runningQueuesAreEmpty && this.blockingQueue.isEmpty()) {
						 console.log("All the processes have been served!");
						 break;
					};
       }
		}
 }
    allQueuesEmpty() {
      let allQueuesEmpty = true;
			this.runningQueues.forEach(queue => {
					if (!queue.isEmpty()) console.log("This queue wasn't empty!", queue);
					if (!queue.isEmpty()) allQueuesEmpty = false;
      });
			    console.log(`Are the running queues empty: ${allQueuesEmpty}`);
			    if (!this.blockingQueue.isEmpty()) allQueuesEmpty = false;
					console.log(`Are the queues empty: ${allQueuesEmpty}`);
					return allQueuesEmpty;
			}

    addNewProcess(process) {
        this.runningQueues[0].enqueue(process);
    }

    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
    handleInterrupt(queue, process, interrupt) {
       switch (interrupt) {
				 case SchedulerInterrupt.PROCESS_BLOCKED:
					 this.blockingQueue.enqueue(process);
					 break;
				 case SchedulerInterrupt.PROCESS_READY: 
					 this.addNewProcess(process);
					 break;
				 case SchedulerInterrupt.LOWER_PRIORITY:
					 if (queue.getQueueType() === Queue.CPU_QUEUE) {
						 const priority = queue.getPriorityLevel();
						  if (priority < 2) {
								this.runningQueues[priority+1].enqueue(process);
							} else { 
								this.runningQueues[priority].enqueue(process);
							}
            } else {
							   this.blockingQueue.enqueue(process);
							}
			    }  
       }
    
    // Private function used for testing; DO NOT MODIFY
    _getCPUQueue(priorityLevel) {
        return this.runningQueues[priorityLevel];
    }

    // Private function used for testing; DO NOT MODIFY
    _getBlockingQueue() {
        return this.blockingQueue;
    }
}

module.exports = Scheduler;
