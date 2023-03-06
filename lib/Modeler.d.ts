import BaseModeler from "./BaseModeler";

import { ImportXMLResult } from "./BaseViewer";

export default class Modeler extends BaseModeler {

  /**
   * Create a new diagram to start modeling.
   *
   * @throws An error thrown during the import of the XML.
   *
   * @return A promise resolving with warnings that were produced during the import.
   */
  createDiagram(): Promise<ImportXMLResult>;
}