import { describe, expect, it } from 'vitest';
import { DEPARTMENTS } from '../../src/data/departments';
import { backLines, jacketForDepartment } from '../../src/logic/jacket';
import { START_JACKET } from '../../src/stores/usePlayerStore';

describe('jacket', () => {
  it('jacketForDepartment_knownDepartment_returnsItsJacket', () => {
    const ee = DEPARTMENTS.find((d) => d.id === 'ee');
    expect(ee).toBeDefined();
    expect(jacketForDepartment('ee')).toEqual(ee?.jacket);
  });
  it('jacketForDepartment_everyDefinedDepartment_departmentLineIsName', () => {
    for (const d of DEPARTMENTS) {
      expect(jacketForDepartment(d.id).departmentLine).toBe(d.name);
    }
  });
  it('jacketForDepartment_sameId_isDeterministic', () => {
    expect(jacketForDepartment('mech')).toEqual(jacketForDepartment('mech'));
  });
  it('startJacket_noDepartment_departmentLineIsNull', () => {
    expect(START_JACKET.departmentLine).toBeNull();
  });
  it('backLines_startJacket_universityOnly', () => {
    expect(backLines(START_JACKET)).toEqual(['INCHEON', 'NATIONAL', 'UNIVERSITY']);
  });
  it('backLines_departmentJacket_addsDepartmentLine', () => {
    expect(backLines(jacketForDepartment('cse'))).toEqual(['INCHEON', 'NATIONAL', 'UNIVERSITY', '컴퓨터공학부']);
  });
});
