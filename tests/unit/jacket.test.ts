import { describe, expect, it } from 'vitest';
import { DEPARTMENTS } from '../../src/data/departments';
import { jacketBackText, jacketForDepartment, splitBackText } from '../../src/logic/jacket';

describe('jacket', () => {
  it('jacketBackText_name_formatsInuNameYear', () => {
    expect(jacketBackText('컴퓨터공학부')).toBe('INU 컴퓨터공학부 27');
  });
  it('jacketForDepartment_knownDepartment_returnsItsJacket', () => {
    const ee = DEPARTMENTS.find((d) => d.id === 'ee');
    expect(ee).toBeDefined();
    expect(jacketForDepartment('ee')).toEqual(ee?.jacket);
  });
  it('jacketForDepartment_everyDefinedDepartment_backTextMatchesName', () => {
    for (const d of DEPARTMENTS) {
      expect(jacketForDepartment(d.id).backText).toBe(`INU ${d.name} 27`);
    }
  });
  it('jacketForDepartment_anyDepartment_hasFormattedBackText', () => {
    expect(jacketForDepartment('urban').backText).toMatch(/^INU .+ 27$/);
  });
  it('jacketForDepartment_sameId_isDeterministic', () => {
    expect(jacketForDepartment('mech')).toEqual(jacketForDepartment('mech'));
  });
  it('splitBackText_threeWords_splitsIntoThreeLines', () => {
    expect(splitBackText('INU 자유전공학부 27')).toEqual(['INU', '자유전공학부', '27']);
  });
  it('splitBackText_otherShape_keepsOneLine', () => {
    expect(splitBackText('HELLO')).toEqual(['HELLO']);
  });
});
