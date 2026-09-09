import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const apiBaseUrl = 'http://10.0.2.2:5220';
const demoEmail = 'flutter.demo@projectmentor.local';
const demoPassword = 'Student123!';

void main() => runApp(const ProjectMentorApp());

class ProjectMentorApp extends StatelessWidget {
  const ProjectMentorApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'ProjectMentor',
        theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo), useMaterial3: true),
        home: const WorkflowScreen(),
      );
}

class WorkflowScreen extends StatefulWidget {
  const WorkflowScreen({super.key});
  @override
  State<WorkflowScreen> createState() => _WorkflowScreenState();
}

class _WorkflowScreenState extends State<WorkflowScreen> {
  String? token;
  Map<String, dynamic>? workflow;
  String message = 'Ready to run the shared API workflow.';
  bool busy = false;

  Future<dynamic> call(String path, {String method = 'GET', Map<String, dynamic>? body, String? auth}) async {
    final headers = {'Content-Type': 'application/json', if (auth != null) 'Authorization': 'Bearer $auth'};
    final uri = Uri.parse('$apiBaseUrl$path');
    final response = method == 'POST'
        ? await http.post(uri, headers: headers, body: jsonEncode(body ?? {}))
        : await http.get(uri, headers: headers);
    final decoded = response.body.isEmpty ? null : jsonDecode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) throw Exception(decoded?.toString() ?? 'Request failed');
    return decoded;
  }

  Future<void> runWorkflow() async {
    setState(() { busy = true; message = 'Logging in and running agents...'; });
    try {
      dynamic session;
      try { session = await call('/api/auth/login', method: 'POST', body: {'email': demoEmail, 'password': demoPassword}); }
      catch (_) {
        await call('/api/auth/register', method: 'POST', body: {'email': demoEmail, 'password': demoPassword, 'fullName': 'Flutter Demo Student', 'yearOfStudy': 2});
        session = await call('/api/auth/login', method: 'POST', body: {'email': demoEmail, 'password': demoPassword});
      }
      token = session['token'];
      final created = await call('/api/roadmap-requests', method: 'POST', auth: token, body: {'year': 2, 'projectType': 'mobile', 'deadline': '2026-10-30', 'hoursPerWeek': 8});
      workflow = await call('/api/roadmap-requests/${created['roadmapRequestId']}', auth: token);
      setState(() => message = 'Workflow paused for student approval.');
    } catch (error) { setState(() => message = error.toString()); }
    finally { setState(() => busy = false); }
  }

  Future<void> decide(String action) async {
    if (token == null || workflow == null) return;
    setState(() { busy = true; message = 'Saving student decision...'; });
    try {
      final path = '/api/roadmaps/${workflow!['id']}/$action';
      workflow = await call(path, method: 'POST', auth: token, body: {'comment': 'Decision from Flutter demo'});
      setState(() => message = 'Decision saved: ${workflow!['status']}');
    } catch (error) { setState(() => message = error.toString()); }
    finally { setState(() => busy = false); }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('ProjectMentor workflow')),
        body: ListView(padding: const EdgeInsets.all(20), children: [
          Text(message),
          const SizedBox(height: 20),
          FilledButton(onPressed: busy ? null : runWorkflow, child: const Text('Login and generate roadmap')),
          if (workflow != null) ...[
            const SizedBox(height: 20),
            Text('Request: ${workflow!['requestStatus']}'),
            Text('Roadmap: ${workflow!['status']}'),
            ...((workflow!['milestones'] as List).map((item) => ListTile(title: Text(item['title']), subtitle: Text('${item['phase']} - ${item['dueDate']}')))),
            if (workflow!['status'] == 'PendingApproval') Row(children: [
              Expanded(child: FilledButton(onPressed: busy ? null : () => decide('accept'), child: const Text('Accept'))),
              const SizedBox(width: 12),
              Expanded(child: OutlinedButton(onPressed: busy ? null : () => decide('request-revision'), child: const Text('Request revision'))),
            ]),
          ],
        ]),
      );
}
