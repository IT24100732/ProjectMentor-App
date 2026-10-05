import 'package:flutter_test/flutter_test.dart';

import 'package:projectmentor_mobile/core/format.dart';

// Pure-logic unit tests for the mobile formatting/date helpers (no plugins, no UI).
void main() {
  group('initials', () {
    test('uses first and last name letters', () {
      expect(initials('Nimal Perera Silva'), 'NS');
      expect(initials('Amara Silva'), 'AS');
    });
    test('handles a single name', () {
      expect(initials('ann'), 'AN');
    });
    test('handles blank/null', () {
      expect(initials(''), '?');
      expect(initials(null), '?');
    });
  });

  group('mondayOf', () {
    test('returns the Monday of the same week', () {
      final m = mondayOf(DateTime(2026, 10, 2)); // Friday
      expect(m.weekday, DateTime.monday);
      expect(m.day, 28);
    });
    test('a Monday maps to itself', () {
      final m = mondayOf(DateTime(2026, 10, 5)); // Monday
      expect(m.day, 5);
    });
  });

  group('parseDay', () {
    test('parses a yyyy-MM-dd string', () {
      final d = parseDay('2026-11-30');
      expect(d, isNotNull);
      expect(d!.year, 2026);
      expect(d.month, 11);
      expect(d.day, 30);
    });
    test('returns null for junk', () {
      expect(parseDay('not-a-date'), isNull);
    });
  });
}
