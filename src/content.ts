import PageInjector from "./background/PageInjector";
import { InjectTypes } from "./background/constants"

const injector = new PageInjector(1, InjectTypes.FixedPosition, "#contents")
injector.inject("<h1 style='color: white;'>Test</h1>")
