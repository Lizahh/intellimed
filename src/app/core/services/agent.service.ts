import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AgentType = 'summer' | 'penny' | 'clara' | 'bill';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private activeAgentSubject = new BehaviorSubject<AgentType>('penny'); // Default to penny (SOAP Notes)
  public activeAgent$: Observable<AgentType> = this.activeAgentSubject.asObservable();

  constructor() { }

  /**
   * Set the currently active agent
   * @param agent The agent to set as active
   */
  setActiveAgent(agent: AgentType): void {
    this.activeAgentSubject.next(agent);
  }

  /**
   * Get the currently active agent
   * @returns The current active agent value
   */
  getActiveAgent(): AgentType {
    return this.activeAgentSubject.value;
  }
}
