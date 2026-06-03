import { useContext } from "react"
import { InterviewContext } from "./InterviewContext"

export function useInterview() {
  return useContext(InterviewContext)
}