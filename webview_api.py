import os
import webview
import json
import traceback
from datetime import datetime
from database import DatabaseManager

class LazzFitAPI:
    def __init__(self):
        """Initialize the API and connect to database"""
        print("🚀 Initializing LazzFit API")
        self.db = DatabaseManager('lazzfit.db')
        self.db.setup()
        
        # Base directory for exports
        self.docs_path = os.path.join(os.path.expanduser('~'), 'Documents', 'LazzFit')
        if not os.path.exists(self.docs_path):
            os.makedirs(self.docs_path)
            
        print(f"📁 Export path: {self.docs_path}")
        
    # ------------------- Run Management Functions ------------------- #
    
    def get_all_runs(self):
        """Get all runs from database"""
        try:
            runs = self.db.get_all_runs()
            # Convert DB rows to dictionaries
            return [
                {
                    'id': run[0],
                    'date': run[1],
                    'distance': run[2],
                    'duration': run[3],
                    'avg_pace': run[4],
                    'avg_bpm': run[5],
                    'max_bpm': run[6],
                    'elevation_gain': run[7],
                    'calories': run[8],
                    'workout_type': run[9],
                    'notes': run[10]
                }
                for run in runs
            ]
        except Exception as e:
            print(f"Error getting runs: {e}")
            traceback.print_exc()
            return []
    
    def get_run(self, run_id):
        """Get a specific run by ID"""
        try:
            run = self.db.get_run(run_id)
            if run:
                return {
                    'id': run[0],
                    'date': run[1],
                    'distance': run[2],
                    'duration': run[3],
                    'avg_pace': run[4],
                    'avg_bpm': run[5],
                    'max_bpm': run[6],
                    'elevation_gain': run[7],
                    'calories': run[8],
                    'workout_type': run[9],
                    'notes': run[10]
                }
            return None
        except Exception as e:
            print(f"Error getting run {run_id}: {e}")
            traceback.print_exc()
            return None
    
    def add_run(self, run_data):
        """Add a new run"""
        try:
            run_id = self.db.add_run(
                run_data['date'],
                run_data['distance'],
                run_data['duration'],
                run_data['avg_bpm'],
                run_data['max_bpm'],
                run_data['elevation_gain'],
                run_data['calories'],
                run_data['workout_type'],
                run_data['notes']
            )
            return run_id is not None
        except Exception as e:
            print(f"Error adding run: {e}")
            traceback.print_exc()
            return False
    
    def update_run(self, run_id, run_data):
        """Update an existing run"""
        try:
            success = self.db.update_run(
                run_id,
                run_data['date'],
                run_data['distance'],
                run_data['duration'],
                run_data['avg_bpm'],
                run_data['max_bpm'],
                run_data['elevation_gain'],
                run_data['calories'],
                run_data['workout_type'],
                run_data['notes']
            )
            return success
        except Exception as e:
            print(f"Error updating run {run_id}: {e}")
            traceback.print_exc()
            return False
    
    def delete_run(self, run_id):
        """Delete a run"""
        try:
            success = self.db.delete_run(run_id)
            return success
        except Exception as e:
            print(f"Error deleting run {run_id}: {e}")
            traceback.print_exc()
            return False
    
    def export_to_csv(self, run_ids=None):
        """Export runs to CSV file"""
        try:
            file_name = f"LazzFit_Runs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            file_path = os.path.join(self.docs_path, file_name)
            
            success = self.db.export_runs_to_csv(file_path, run_ids)
            
            if success:
                return {'success': True, 'path': file_path}
            else:
                return {'success': False, 'path': None}
        except Exception as e:
            print(f"Error exporting to CSV: {e}")
            traceback.print_exc()
            return {'success': False, 'path': None}
    
    def export_to_excel(self, run_ids=None):
        """Export runs to Excel file"""
        try:
            # Check if export to Excel is available
            if not self.db.EXCEL_AVAILABLE:
                return {'success': False, 'path': None, 'error': 'Excel export not available'}
                
            file_name = f"LazzFit_Runs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            file_path = os.path.join(self.docs_path, file_name)
            
            success = self.db.export_runs_to_xlsx(file_path, run_ids)
            
            if success:
                return {'success': True, 'path': file_path}
            else:
                return {'success': False, 'path': None}
        except Exception as e:
            print(f"Error exporting to Excel: {e}")
            traceback.print_exc()
            return {'success': False, 'path': None}
    
    def get_workout_types(self):
        """Get available workout types"""
        try:
            return self.db.get_workout_types()
        except Exception as e:
            print(f"Error getting workout types: {e}")
            traceback.print_exc()
            return ["Corrida de Rua", "Corrida na Esteira", "Trail Running", "Outro"]
    
    # ------------------- Training Plan Management Functions ------------------- #
    
    def get_all_training_plans(self):
        """Get all training plans"""
        try:
            plans = self.db.get_all_training_plans()
            # Convert DB rows to dictionaries
            return [
                {
                    'id': plan[0],
                    'name': plan[1],
                    'goal': plan[2],
                    'duration_weeks': plan[3],
                    'level': plan[4],
                    'notes': plan[5],
                    'created_at': plan[6],
                    'updated_at': plan[7]
                }
                for plan in plans
            ]
        except Exception as e:
            print(f"Error getting training plans: {e}")
            traceback.print_exc()
            return []
    
    def get_training_plan(self, plan_id):
        """Get a specific training plan by ID with all its weeks and sessions"""
        try:
            plan = self.db.get_training_plan(plan_id)
            return plan
        except Exception as e:
            print(f"Error getting training plan {plan_id}: {e}")
            traceback.print_exc()
            return None
    
    def create_training_plan(self, name, goal, duration_weeks, level, notes=""):
        """Create a new training plan"""
        try:
            plan_id = self.db.create_training_plan(name, goal, duration_weeks, level, notes)
            return plan_id
        except Exception as e:
            print(f"Error creating training plan: {e}")
            traceback.print_exc()
            return None
    
    def create_training_plan_complete(self, plan_data):
        """Create a complete training plan with all sessions"""
        try:
            # First create the base plan
            plan_id = self.db.create_training_plan(
                plan_data['name'], 
                plan_data['goal'],
                plan_data['duration_weeks'],
                plan_data['level'],
                plan_data['notes']
            )
            
            if not plan_id:
                return None
                
            # The database function already creates empty weeks and sessions
            # For each week, update the focus and sessions
            for week_index, week in enumerate(plan_data.get('weeks', [])):
                week_number = week_index + 1
                
                # Find the corresponding week in the database
                self.db.connect()
                self.db.cursor.execute(
                    "SELECT id FROM training_weeks WHERE plan_id = ? AND week_number = ?",
                    (plan_id, week_number)
                )
                week_row = self.db.cursor.fetchone()
                
                if not week_row:
                    print(f"Week {week_number} not found for plan {plan_id}")
                    continue
                    
                week_id = week_row[0]
                
                # Update week data
                self.db.update_training_week(
                    week_id,
                    week.get('focus', f'Semana {week_number}'),
                    week.get('total_distance', 0),
                    week.get('notes', '')
                )
                
                # Update sessions for this week
                for session in plan_data.get('sessions', []):
                    day = session.get('day')
                    if day is None:
                        continue
                        
                    # Find the session for this day in this week
                    self.db.connect()
                    self.db.cursor.execute(
                        "SELECT id FROM training_sessions WHERE week_id = ? AND day_of_week = ?",
                        (week_id, day)
                    )
                    session_row = self.db.cursor.fetchone()
                    
                    if not session_row:
                        print(f"Session for day {day} not found in week {week_number}")
                        continue
                        
                    session_id = session_row[0]
                    
                    # Check if this is a training day
                    is_training_day = plan_data.get('trainingDays', {}).get(str(day), False)
                    
                    # Update session data
                    self.db.update_training_session(
                        session_id,
                        session.get('workout_type', 'Descanso') if is_training_day else 'Descanso',
                        session.get('distance', 0) if is_training_day else 0,
                        session.get('duration', 0) if is_training_day else 0,
                        session.get('intensity', 'Baixa') if is_training_day else 'Nenhuma',
                        session.get('pace_target', '') if is_training_day else '',
                        session.get('hr_zone', '') if is_training_day else '',
                        session.get('details', '') if is_training_day else ''
                    )
            
            return plan_id
        except Exception as e:
            print(f"Error creating complete training plan: {e}")
            traceback.print_exc()
            return None
    
    def update_training_plan(self, plan_id, name, goal, duration_weeks, level, notes=""):
        """Update a training plan"""
        try:
            success = self.db.update_training_plan(plan_id, name, goal, duration_weeks, level, notes)
            return success
        except Exception as e:
            print(f"Error updating training plan {plan_id}: {e}")
            traceback.print_exc()
            return False
    
    def update_training_plan_complete(self, plan_data):
        """Update a complete training plan with all sessions"""
        try:
            plan_id = plan_data.get('id')
            if not plan_id:
                return False
                
            # Update the base plan
            self.db.update_training_plan(
                plan_id,
                plan_data['name'],
                plan_data['goal'],
                plan_data['duration_weeks'],
                plan_data['level'],
                plan_data['notes']
            )
            
            # For each week in the plan data, update it
            for week in plan_data.get('weeks', []):
                week_id = week.get('id')
                if not week_id:
                    continue
                    
                # Update week data
                self.db.update_training_week(
                    week_id,
                    week.get('focus', ''),
                    week.get('total_distance', 0),
                    week.get('notes', '')
                )
                
                # Update the sessions for this week
                for session in week.get('sessions', []):
                    session_id = session.get('id')
                    if not session_id:
                        continue
                        
                    day = session.get('day_of_week')
                    
                    # Check if this is a training day
                    is_training_day = plan_data.get('trainingDays', {}).get(str(day), False)
                    
                    # Update session data
                    self.db.update_training_session(
                        session_id,
                        session.get('workout_type', 'Descanso') if is_training_day else 'Descanso',
                        session.get('distance', 0) if is_training_day else 0,
                        session.get('duration', 0) if is_training_day else 0,
                        session.get('intensity', 'Baixa') if is_training_day else 'Nenhuma',
                        session.get('pace_target', '') if is_training_day else '',
                        session.get('hr_zone', '') if is_training_day else '',
                        session.get('details', '') if is_training_day else ''
                    )
            
            return plan_id
        except Exception as e:
            print(f"Error updating complete training plan: {e}")
            traceback.print_exc()
            return False
    
    def delete_training_plan(self, plan_id):
        """Delete a training plan"""
        try:
            success = self.db.delete_training_plan(plan_id)
            return success
        except Exception as e:
            print(f"Error deleting training plan {plan_id}: {e}")
            traceback.print_exc()
            return False
    
    def export_training_plan_to_xlsx(self, plan_id):
        """Export a training plan to Excel"""
        try:
            # Check if export to Excel is available
            if not self.db.EXCEL_AVAILABLE:
                return {'success': False, 'path': None, 'error': 'Excel export not available'}
            
            # Get the plan name for the file name
            plan = self.db.get_training_plan(plan_id)
            if not plan:
                return {'success': False, 'path': None, 'error': 'Plan not found'}
                
            plan_name = plan['name'].replace(' ', '_')
            file_name = f"LazzFit_Plan_{plan_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            file_path = os.path.join(self.docs_path, file_name)
            
            success = self.db.export_training_plan_to_xlsx(plan_id, file_path)
            
            if success:
                return {'success': True, 'path': file_path}
            else:
                return {'success': False, 'path': None}
        except Exception as e:
            print(f"Error exporting training plan {plan_id} to Excel: {e}")
            traceback.print_exc()
            return {'success': False, 'path': None, 'error': str(e)}

# Python app entry point
def main():
    """Main entry point for the LazzFit application"""
    try:
        print("Starting LazzFit application...")
        api = LazzFitAPI()
        window = webview.create_window(
            'LazzFit - Gerenciador de Treinos',
            'webui/index.html',
            js_api=api,
            width=1100,
            height=750,
            min_size=(800, 600)
        )
        webview.start(debug=True)
    except Exception as e:
        print(f"Error starting application: {e}")
        traceback.print_exc()

if __name__ == '__main__':
    main()
